begin;

create table public.social_intentions (
  id text primary key check (id in ('thoughtful_people', 'shared_taste', 'deeper_conversations', 'small_communities', 'ritual_connection', 'private_exploration')),
  label text not null unique,
  position smallint not null unique check (position > 0),
  active boolean not null default true
);
insert into public.social_intentions(id, label, position) values
  ('thoughtful_people', 'Meet thoughtful people', 1),
  ('shared_taste', 'Find people through shared taste', 2),
  ('deeper_conversations', 'Have deeper conversations', 3),
  ('small_communities', 'Join small interest communities', 4),
  ('ritual_connection', 'Try a 21-night connection', 5),
  ('private_exploration', 'Explore privately for now', 6);

create table public.user_social_intentions (
  user_id uuid not null references auth.users(id) on delete cascade,
  intention_id text not null references public.social_intentions(id),
  created_at timestamptz not null default now(),
  primary key (user_id, intention_id)
);

create table public.discovery_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  discoverable boolean not null default false,
  open_to_sparks boolean not null default false,
  open_to_ritual boolean not null default false,
  taste_categories text[] not null default array['music']::text[],
  archetype_affects_matching boolean not null default false,
  imported_music_affects_matching boolean not null default false,
  updated_at timestamptz not null default now(),
  check (taste_categories <@ array['music','movie','series','book','anime','food','place','quote','memory','other']::text[])
);

alter table public.taste_objects
  add column object_type text not null default 'other'
  check (object_type in ('artist','song','album','film','series','book','anime','food','place','quote','memory','other'));

alter table public.user_taste_objects
  add column identity_roles text[] not null default '{}'
    check (identity_roles <@ array['favourite_artist','favourite_song','current_song','comfort_song','feels_like_me','favourite_album','broader_interest']::text[]),
  add column privacy_reviewed_at timestamptz;

create or replace function private.validate_identity_roles()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_object_type text;
begin
  select object_type into v_object_type from public.taste_objects where id = new.taste_object_id;
  if v_object_type = 'artist' and not (new.identity_roles <@ array['favourite_artist']::text[]) then
    raise exception 'artist has an incompatible identity role' using errcode = '22023';
  elsif v_object_type = 'song' and not (new.identity_roles <@ array['favourite_song','current_song','comfort_song','feels_like_me']::text[]) then
    raise exception 'song has an incompatible identity role' using errcode = '22023';
  elsif v_object_type = 'album' and not (new.identity_roles <@ array['favourite_album']::text[]) then
    raise exception 'album has an incompatible identity role' using errcode = '22023';
  elsif v_object_type not in ('artist','song','album') and cardinality(new.identity_roles) > 0 then
    raise exception 'object type cannot carry a music identity role' using errcode = '22023';
  end if;
  return new;
end;
$$;
create trigger user_taste_objects_validate_identity_roles
before insert or update of taste_object_id, identity_roles on public.user_taste_objects
for each row execute function private.validate_identity_roles();

create trigger discovery_preferences_set_updated_at before update on public.discovery_preferences
for each row execute function private.set_updated_at();

alter table public.social_intentions enable row level security;
alter table public.user_social_intentions enable row level security;
alter table public.discovery_preferences enable row level security;

create policy social_intentions_read_authenticated on public.social_intentions
for select to authenticated using (active);
create policy user_social_intentions_select_own on public.user_social_intentions
for select to authenticated using (user_id = auth.uid());
create policy user_social_intentions_insert_own on public.user_social_intentions
for insert to authenticated with check (user_id = auth.uid());
create policy user_social_intentions_delete_own on public.user_social_intentions
for delete to authenticated using (user_id = auth.uid());
create policy discovery_preferences_select_own on public.discovery_preferences
for select to authenticated using (user_id = auth.uid());
create policy discovery_preferences_insert_own on public.discovery_preferences
for insert to authenticated with check (user_id = auth.uid());
create policy discovery_preferences_update_own on public.discovery_preferences
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (anonymous_name, locale, timezone) on public.profiles to authenticated;
grant select on public.social_intentions to authenticated;
grant select, insert, delete on public.user_social_intentions to authenticated;
grant select, insert, update on public.discovery_preferences to authenticated;
revoke all on public.social_intentions, public.user_social_intentions, public.discovery_preferences from anon;

create or replace function public.add_manual_identity_object(
  p_object_type text,
  p_title text,
  p_creator_name text,
  p_identity_roles text[] default '{}'
)
returns public.user_taste_objects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_object_id uuid;
  v_result public.user_taste_objects;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_object_type not in ('artist','song','album') then raise exception 'unsupported music object type' using errcode = '22023'; end if;
  if not (coalesce(p_identity_roles, '{}') <@ array['favourite_artist','favourite_song','current_song','comfort_song','feels_like_me','favourite_album']::text[]) then
    raise exception 'unsupported identity role' using errcode = '22023';
  end if;
  if char_length(trim(p_title)) not between 1 and 180 then raise exception 'title must contain 1 to 180 characters' using errcode = '22023'; end if;
  if exists (
    select 1 from public.user_taste_objects shelf
    join public.taste_objects object on object.id = shelf.taste_object_id
    where shelf.user_id = v_user_id and object.provider = 'manual'
      and object.object_type = p_object_type and lower(object.title) = lower(trim(p_title))
  ) then raise exception 'duplicate object' using errcode = '23505'; end if;

  insert into public.taste_objects(category, provider, title, creator_name, object_type)
  values ('music', 'manual', trim(p_title), nullif(trim(p_creator_name), ''), p_object_type)
  returning id into v_object_id;

  insert into public.user_taste_objects(
    user_id, taste_object_id, relationship_type, visibility,
    use_for_matching, identity_roles
  ) values (
    v_user_id, v_object_id,
    case when p_object_type = 'artist' then 'favourite' when p_object_type = 'album' then 'favourite' else 'currently_into' end,
    'private', false, coalesce(p_identity_roles, '{}')
  ) returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.set_social_intentions(p_intention_ids text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if exists (select 1 from unnest(p_intention_ids) selected(id) where not exists (select 1 from public.social_intentions where social_intentions.id = selected.id and active)) then
    raise exception 'unknown social intention' using errcode = '22023';
  end if;
  delete from public.user_social_intentions where user_id = v_user_id;
  insert into public.user_social_intentions(user_id, intention_id)
  select v_user_id, id from (select distinct unnest(p_intention_ids) id) selected;
end;
$$;

create or replace function public.reorder_identity_shelf(p_shelf_item_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if cardinality(coalesce(p_shelf_item_ids, '{}')) <> (select count(distinct id) from unnest(coalesce(p_shelf_item_ids, '{}')) selected(id)) then
    raise exception 'shelf order contains duplicates' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(coalesce(p_shelf_item_ids, '{}')) selected(id) where not exists (select 1 from public.user_taste_objects where user_taste_objects.id = selected.id and user_id = v_user_id)) then
    raise exception 'shelf item not owned by caller' using errcode = '42501';
  end if;
  update public.user_taste_objects shelf set position = ordered.position
  from (
    select id, (ordinality - 1)::integer position
    from unnest(coalesce(p_shelf_item_ids, '{}')) with ordinality selected(id, ordinality)
  ) ordered
  where shelf.id = ordered.id and shelf.user_id = v_user_id;
end;
$$;

create or replace function public.complete_identity_onboarding(p_enable_discovery boolean default false)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if not exists (select 1 from public.profiles where user_id = v_user_id) then raise exception 'private account setup is incomplete' using errcode = '22023'; end if;
  if not exists (select 1 from public.user_social_intentions where user_id = v_user_id) then raise exception 'select at least one social intention' using errcode = '22023'; end if;
  if (select count(*) from public.user_taste_objects shelf join public.taste_objects object on object.id = shelf.taste_object_id where shelf.user_id = v_user_id and object.object_type = 'artist') < 5 then
    raise exception 'five artists are required' using errcode = '22023';
  end if;
  if (select count(*) from public.user_taste_objects shelf join public.taste_objects object on object.id = shelf.taste_object_id where shelf.user_id = v_user_id and object.object_type = 'song') < 5 then
    raise exception 'five songs are required' using errcode = '22023';
  end if;
  if not exists (select 1 from public.user_taste_objects shelf join public.taste_objects object on object.id = shelf.taste_object_id where shelf.user_id = v_user_id and object.object_type = 'song' and 'current_song' = any(shelf.identity_roles)) then raise exception 'current song is required' using errcode = '22023'; end if;
  if not exists (select 1 from public.user_taste_objects shelf join public.taste_objects object on object.id = shelf.taste_object_id where shelf.user_id = v_user_id and object.object_type = 'song' and 'comfort_song' = any(shelf.identity_roles)) then raise exception 'comfort song is required' using errcode = '22023'; end if;
  if not exists (select 1 from public.user_taste_objects shelf join public.taste_objects object on object.id = shelf.taste_object_id where shelf.user_id = v_user_id and object.object_type = 'song' and 'feels_like_me' = any(shelf.identity_roles)) then raise exception 'identity song is required' using errcode = '22023'; end if;
  if exists (select 1 from public.user_taste_objects where user_id = v_user_id and cardinality(identity_roles) > 0 and privacy_reviewed_at is null) then
    raise exception 'review every selected object privacy setting' using errcode = '22023';
  end if;
  if not exists (select 1 from public.user_taste_objects where user_id = v_user_id and (nullif(trim(personal_note), '') is not null or nullif(trim(emotional_meaning), '') is not null)) then
    raise exception 'add meaning to at least one object' using errcode = '22023';
  end if;

  insert into public.discovery_preferences(user_id, discoverable)
  values (v_user_id, coalesce(p_enable_discovery, false))
  on conflict (user_id) do update set discoverable = excluded.discoverable;

  update public.profiles set
    onboarding_completed = true,
    discovery_enabled = coalesce(p_enable_discovery, false),
    profile_visibility = case when coalesce(p_enable_discovery, false) then 'profile' else 'private' end
  where user_id = v_user_id returning * into v_profile;

  update public.onboarding_sessions set
    current_step = 'complete',
    completed_steps = array['account','age_confirmation','display_identity','social_intention','music_selection','emotional_prompts','privacy_settings'],
    completed_at = now()
  where user_id = v_user_id;
  return v_profile;
end;
$$;

revoke all on function public.add_manual_identity_object(text,text,text,text[]) from public, anon;
grant execute on function public.add_manual_identity_object(text,text,text,text[]) to authenticated;
revoke all on function public.set_social_intentions(text[]) from public, anon;
grant execute on function public.set_social_intentions(text[]) to authenticated;
revoke all on function public.reorder_identity_shelf(uuid[]) from public, anon;
grant execute on function public.reorder_identity_shelf(uuid[]) to authenticated;
revoke all on function public.complete_identity_onboarding(boolean) from public, anon;
grant execute on function public.complete_identity_onboarding(boolean) to authenticated;

commit;
