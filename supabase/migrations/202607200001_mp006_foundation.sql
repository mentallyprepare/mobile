begin;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  anonymous_name text not null check (char_length(anonymous_name) between 2 and 40),
  locale text not null default 'en' check (char_length(locale) between 2 and 16),
  timezone text not null default 'Asia/Kolkata' check (char_length(timezone) between 3 and 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null check (char_length(policy_version) between 1 and 32),
  age_confirmed boolean not null,
  terms_accepted boolean not null,
  privacy_accepted boolean not null,
  research_consent boolean not null default false,
  event_type text not null check (event_type in ('granted', 'withdrawn')),
  recorded_at timestamptz not null default now()
);
create index consent_records_user_id_idx on public.consent_records(user_id, recorded_at desc);

create table private.connection_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  languages text[] not null default '{}',
  availability jsonb not null default '{}'::jsonb,
  safeguarding jsonb not null default '{}'::jsonb,
  boundaries jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);

create table private.taste_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('music', 'book', 'film', 'show', 'game')),
  normalized_value text not null check (char_length(normalized_value) between 1 and 160),
  display_value text not null check (char_length(display_value) between 1 and 160),
  created_at timestamptz not null default now(),
  unique (user_id, category, normalized_value)
);
create index taste_items_user_id_idx on private.taste_items(user_id);

create table private.reflective_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  model_version text not null,
  derived_preferences jsonb not null,
  derived_at timestamptz not null default now(),
  raw_answers_deleted_at timestamptz
);

create table public.match_pool_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state text not null default 'waiting' check (state in ('waiting', 'paused', 'matched')),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete restrict,
  user_b uuid not null references auth.users(id) on delete restrict,
  state text not null default 'active' check (state in ('active', 'ended', 'blocked')),
  explanation_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  check (user_a <> user_b),
  check (user_a < user_b)
);
create unique index matches_active_user_a_idx on private.matches(user_a) where state = 'active';
create unique index matches_active_user_b_idx on private.matches(user_b) where state = 'active';

create or replace function private.enforce_single_active_match()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.state <> 'active' then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended(least(new.user_a::text, new.user_b::text), 0));
  perform pg_advisory_xact_lock(hashtextextended(greatest(new.user_a::text, new.user_b::text), 0));
  if exists (
    select 1 from private.matches m
    where m.id <> new.id and m.state = 'active'
      and (m.user_a in (new.user_a, new.user_b) or m.user_b in (new.user_a, new.user_b))
  ) then
    raise exception 'a user already has an active match' using errcode = '23505';
  end if;
  return new;
end;
$$;
create trigger matches_single_active_user
before insert or update of state, user_a, user_b on private.matches
for each row execute function private.enforce_single_active_match();

create table public.match_memberships (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references private.matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references auth.users(id) on delete cascade,
  partner_pseudonym text not null check (char_length(partner_pseudonym) between 2 and 40),
  state text not null default 'active' check (state in ('active', 'ended', 'blocked')),
  created_at timestamptz not null default now(),
  unique (match_id, user_id),
  check (user_id <> partner_id)
);
create index match_memberships_user_id_idx on public.match_memberships(user_id, state);
create index match_memberships_match_id_idx on public.match_memberships(match_id);

create table public.rituals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references private.matches(id) on delete restrict,
  state text not null default 'active' check (state in ('active', 'paused', 'completed', 'ended')),
  starts_on date not null,
  current_night smallint not null default 1 check (current_night between 1 and 21),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rituals_match_id_idx on public.rituals(match_id);

create table public.daily_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_set_version text not null,
  night smallint not null check (night between 1 and 21),
  prompt text not null check (char_length(prompt) between 1 and 500),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (prompt_set_version, night)
);

create table public.writing_drafts (
  id uuid primary key,
  ritual_id uuid not null references public.rituals(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  night smallint not null check (night between 1 and 21),
  content text not null default '' check (char_length(content) <= 10000),
  client_revision bigint not null default 0 check (client_revision >= 0),
  server_revision bigint not null default 1 check (server_revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ritual_id, author_id, night)
);
create index writing_drafts_author_id_idx on public.writing_drafts(author_id, updated_at desc);

create table public.sealed_entries (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references public.rituals(id) on delete restrict,
  author_id uuid not null references auth.users(id) on delete cascade,
  night smallint not null check (night between 1 and 21),
  content text not null check (char_length(content) between 1 and 10000),
  source_draft_id uuid not null references public.writing_drafts(id) on delete restrict,
  idempotency_key uuid not null,
  sealed_at timestamptz not null default now(),
  unique (ritual_id, author_id, night),
  unique (author_id, idempotency_key)
);
create index sealed_entries_author_id_idx on public.sealed_entries(author_id, sealed_at desc);

create table public.partner_presence (
  ritual_id uuid not null references public.rituals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  night smallint not null check (night between 1 and 21),
  has_sealed boolean not null default false,
  recorded_at timestamptz not null default now(),
  primary key (ritual_id, user_id, night)
);

create table public.reveal_artifacts (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references public.rituals(id) on delete cascade,
  source_user_id uuid not null references auth.users(id) on delete cascade,
  artifact_type text not null check (artifact_type in ('taste', 'reflection', 'identity')),
  safe_payload jsonb not null,
  release_night smallint not null check (release_night between 1 and 21),
  released_at timestamptz,
  created_at timestamptz not null default now()
);
create index reveal_artifacts_ritual_id_idx on public.reveal_artifacts(ritual_id, release_night);

create table public.reveal_decisions (
  artifact_id uuid not null references public.reveal_artifacts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('consent', 'decline')),
  decided_at timestamptz not null default now(),
  primary key (artifact_id, user_id)
);

create table public.identity_reveal_requests (
  ritual_id uuid not null references public.rituals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('pending', 'consent', 'decline')),
  decided_at timestamptz,
  primary key (ritual_id, user_id)
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_id_idx on public.blocks(blocked_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete restrict,
  category text not null check (category in ('safety', 'harassment', 'privacy', 'spam', 'other')),
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'closed')),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);
create index reports_reporter_id_idx on public.reports(reporter_id, created_at desc);

create table private.report_evidence (
  report_id uuid primary key references public.reports(id) on delete cascade,
  encrypted_evidence text not null,
  created_at timestamptz not null default now()
);

create table private.moderator_assignments (
  report_id uuid not null references public.reports(id) on delete cascade,
  moderator_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (report_id, moderator_id)
);

create table public.rematch_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ritual_id uuid references public.rituals(id) on delete set null,
  state text not null default 'requested' check (state in ('requested', 'cooldown', 'eligible', 'fulfilled')),
  created_at timestamptz not null default now()
);

create table private.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  quiet_hours jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table private.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_key text not null,
  safe_payload jsonb not null default '{}'::jsonb,
  state text not null default 'queued' check (state in ('queued', 'sent', 'failed', 'cancelled')),
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table private.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state text not null default 'requested' check (state in ('requested', 'confirmed', 'processing', 'completed', 'failed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  audit_reference uuid
);

create table private.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  redacted_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_actor_id_idx on private.audit_events(actor_id, created_at desc);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger match_pool_entries_set_updated_at before update on public.match_pool_entries
for each row execute function private.set_updated_at();
create trigger rituals_set_updated_at before update on public.rituals
for each row execute function private.set_updated_at();
create trigger writing_drafts_set_updated_at before update on public.writing_drafts
for each row execute function private.set_updated_at();

create or replace function private.is_unblocked_match_member(p_match_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.match_memberships mm
    where mm.match_id = p_match_id
      and mm.user_id = p_user_id
      and mm.state = 'active'
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = p_user_id and b.blocked_id = mm.partner_id)
           or (b.blocker_id = mm.partner_id and b.blocked_id = p_user_id)
      )
  );
$$;

create or replace function private.can_access_ritual(p_ritual_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.rituals r
    where r.id = p_ritual_id
      and private.is_unblocked_match_member(r.match_id, p_user_id)
  );
$$;

revoke all on function private.is_unblocked_match_member(uuid, uuid) from public;
revoke all on function private.can_access_ritual(uuid, uuid) from public;

create or replace function public.save_draft(
  p_draft_id uuid,
  p_ritual_id uuid,
  p_night smallint,
  p_content text,
  p_client_revision bigint,
  p_expected_server_revision bigint default null
)
returns public.writing_drafts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.writing_drafts;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_night not between 1 and 21 or char_length(p_content) > 10000 then
    raise exception 'invalid draft payload' using errcode = '22023';
  end if;
  if not private.can_access_ritual(p_ritual_id, auth.uid()) then
    raise exception 'ritual unavailable' using errcode = '42501';
  end if;

  select * into v_draft from public.writing_drafts where id = p_draft_id for update;
  if not found then
    if p_expected_server_revision is not null and p_expected_server_revision <> 0 then
      raise exception 'draft revision conflict' using errcode = '40001';
    end if;
    insert into public.writing_drafts(id, ritual_id, author_id, night, content, client_revision)
    values (p_draft_id, p_ritual_id, auth.uid(), p_night, p_content, p_client_revision)
    returning * into v_draft;
  else
    if v_draft.author_id <> auth.uid() or v_draft.ritual_id <> p_ritual_id or v_draft.night <> p_night then
      raise exception 'draft unavailable' using errcode = '42501';
    end if;
    if p_expected_server_revision is null or v_draft.server_revision <> p_expected_server_revision then
      raise exception 'draft revision conflict' using errcode = '40001';
    end if;
    update public.writing_drafts
      set content = p_content,
          client_revision = p_client_revision,
          server_revision = server_revision + 1
      where id = p_draft_id
      returning * into v_draft;
  end if;
  return v_draft;
end;
$$;

create or replace function public.seal_entry(
  p_draft_id uuid,
  p_idempotency_key uuid
)
returns public.sealed_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.writing_drafts;
  v_entry public.sealed_entries;
begin
  if auth.uid() is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select * into v_entry from public.sealed_entries
    where author_id = auth.uid() and idempotency_key = p_idempotency_key;
  if found then return v_entry; end if;

  select * into v_draft from public.writing_drafts
    where id = p_draft_id and author_id = auth.uid() for update;
  if not found or btrim(v_draft.content) = '' then
    raise exception 'draft unavailable or empty' using errcode = '22023';
  end if;
  if not private.can_access_ritual(v_draft.ritual_id, auth.uid()) then
    raise exception 'ritual unavailable' using errcode = '42501';
  end if;

  insert into public.sealed_entries(
    ritual_id, author_id, night, content, source_draft_id, idempotency_key
  ) values (
    v_draft.ritual_id, auth.uid(), v_draft.night, v_draft.content, v_draft.id, p_idempotency_key
  ) returning * into v_entry;

  insert into public.partner_presence(ritual_id, user_id, night, has_sealed)
  values (v_draft.ritual_id, auth.uid(), v_draft.night, true)
  on conflict (ritual_id, user_id, night)
  do update set has_sealed = true, recorded_at = now();

  return v_entry;
end;
$$;

create or replace function public.block_user(p_blocked_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or auth.uid() = p_blocked_user_id then
    raise exception 'invalid block request' using errcode = '22023';
  end if;
  insert into public.blocks(blocker_id, blocked_id)
  values (auth.uid(), p_blocked_user_id)
  on conflict do nothing;
  update public.match_memberships
    set state = 'blocked'
    where user_id = auth.uid() and partner_id = p_blocked_user_id and state = 'active';
end;
$$;

revoke all on function public.save_draft(uuid, uuid, smallint, text, bigint, bigint) from public, anon;
revoke all on function public.seal_entry(uuid, uuid) from public, anon;
revoke all on function public.block_user(uuid) from public, anon;
grant execute on function public.save_draft(uuid, uuid, smallint, text, bigint, bigint) to authenticated;
grant execute on function public.seal_entry(uuid, uuid) to authenticated;
grant execute on function public.block_user(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.consent_records enable row level security;
alter table public.match_pool_entries enable row level security;
alter table public.match_memberships enable row level security;
alter table public.rituals enable row level security;
alter table public.daily_prompts enable row level security;
alter table public.writing_drafts enable row level security;
alter table public.sealed_entries enable row level security;
alter table public.partner_presence enable row level security;
alter table public.reveal_artifacts enable row level security;
alter table public.reveal_decisions enable row level security;
alter table public.identity_reveal_requests enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.rematch_requests enable row level security;

alter table private.connection_preferences enable row level security;
alter table private.taste_items enable row level security;
alter table private.reflective_profiles enable row level security;
alter table private.matches enable row level security;
alter table private.report_evidence enable row level security;
alter table private.moderator_assignments enable row level security;
alter table private.notification_preferences enable row level security;
alter table private.notification_jobs enable row level security;
alter table private.deletion_requests enable row level security;
alter table private.audit_events enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using (user_id = auth.uid());
create policy profiles_insert_own on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy consent_records_select_own on public.consent_records for select to authenticated using (user_id = auth.uid());
create policy consent_records_insert_own on public.consent_records for insert to authenticated with check (user_id = auth.uid());
create policy match_pool_entries_select_own on public.match_pool_entries for select to authenticated using (user_id = auth.uid());
create policy match_memberships_select_own on public.match_memberships for select to authenticated using (user_id = auth.uid());
create policy rituals_select_member on public.rituals for select to authenticated using (private.can_access_ritual(id, auth.uid()));
create policy daily_prompts_select_authenticated on public.daily_prompts for select to authenticated using (active);
create policy writing_drafts_select_own on public.writing_drafts for select to authenticated using (author_id = auth.uid());
create policy sealed_entries_select_own on public.sealed_entries for select to authenticated using (author_id = auth.uid());
create policy partner_presence_select_member on public.partner_presence for select to authenticated using (private.can_access_ritual(ritual_id, auth.uid()));
create policy reveal_artifacts_select_released_member on public.reveal_artifacts for select to authenticated
  using (released_at is not null and private.can_access_ritual(ritual_id, auth.uid()));
create policy reveal_decisions_select_own on public.reveal_decisions for select to authenticated using (user_id = auth.uid());
create policy reveal_decisions_insert_own on public.reveal_decisions for insert to authenticated
  with check (
    user_id = auth.uid() and exists (
      select 1 from public.reveal_artifacts a
      where a.id = artifact_id and private.can_access_ritual(a.ritual_id, auth.uid())
    )
  );
create policy reveal_decisions_update_own on public.reveal_decisions for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid() and exists (
      select 1 from public.reveal_artifacts a
      where a.id = artifact_id and private.can_access_ritual(a.ritual_id, auth.uid())
    )
  );
create policy identity_reveal_requests_select_own on public.identity_reveal_requests for select to authenticated using (user_id = auth.uid());
create policy blocks_select_own on public.blocks for select to authenticated using (blocker_id = auth.uid());
create policy reports_select_own on public.reports for select to authenticated using (reporter_id = auth.uid());
create policy rematch_requests_select_own on public.rematch_requests for select to authenticated using (user_id = auth.uid());

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.consent_records to authenticated;
grant select on public.match_pool_entries, public.match_memberships, public.rituals, public.daily_prompts to authenticated;
grant select on public.writing_drafts, public.sealed_entries, public.partner_presence to authenticated;
grant select on public.reveal_artifacts to authenticated;
grant select, insert, update on public.reveal_decisions to authenticated;
grant select on public.identity_reveal_requests, public.blocks, public.reports, public.rematch_requests to authenticated;

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_unblocked_match_member(uuid, uuid) to authenticated;
grant execute on function private.can_access_ritual(uuid, uuid) to authenticated;

commit;
