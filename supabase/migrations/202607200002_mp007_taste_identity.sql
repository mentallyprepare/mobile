begin;

create table public.taste_categories (
  id text primary key check (id in ('music', 'movie', 'series', 'book', 'anime', 'food', 'place', 'quote', 'memory', 'other')),
  label text not null unique check (char_length(label) between 2 and 32),
  position smallint not null unique check (position > 0)
);

insert into public.taste_categories (id, label, position) values
  ('music', 'Music', 1),
  ('movie', 'Movies', 2),
  ('series', 'Series', 3),
  ('book', 'Books', 4),
  ('anime', 'Anime', 5),
  ('food', 'Food', 6),
  ('place', 'Places', 7),
  ('quote', 'Quotes', 8),
  ('memory', 'Memories', 9),
  ('other', 'Other', 10);

create table public.taste_objects (
  id uuid primary key default gen_random_uuid(),
  category text not null references public.taste_categories(id),
  provider text not null check (provider in ('manual', 'spotify', 'apple_music', 'tmdb', 'google_books', 'open_library', 'anilist')),
  provider_object_id text,
  title text not null check (char_length(title) between 1 and 180),
  subtitle text check (subtitle is null or char_length(subtitle) <= 180),
  creator_name text check (creator_name is null or char_length(creator_name) <= 180),
  description text check (description is null or char_length(description) <= 1000),
  image_url text check (image_url is null or char_length(image_url) <= 2048),
  release_year smallint check (release_year is null or release_year between 1000 and 2200),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index taste_objects_category_title_idx on public.taste_objects(category, lower(title));
create unique index taste_objects_provider_id_idx on public.taste_objects(provider, provider_object_id)
where provider_object_id is not null;

create table public.user_taste_objects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  taste_object_id uuid not null references public.taste_objects(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('favourite', 'currently_into', 'changed_me', 'comfort_object', 'reminds_me_of_home', 'want_to_discuss', 'private_memory', 'recommendation')),
  personal_note text check (personal_note is null or char_length(personal_note) <= 1000),
  emotional_meaning text check (emotional_meaning is null or char_length(emotional_meaning) <= 1000),
  context_prompt text check (context_prompt is null or char_length(context_prompt) <= 240),
  visibility text not null default 'private' check (visibility in ('private', 'connections', 'profile')),
  use_for_matching boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, taste_object_id)
);
create index user_taste_objects_user_position_idx on public.user_taste_objects(user_id, position, created_at);

create table public.onboarding_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step text not null default 'account' check (current_step in ('account', 'age_confirmation', 'display_identity', 'social_intention', 'music_selection', 'additional_taste', 'emotional_prompts', 'archetype_assessment', 'privacy_settings', 'safety_agreement', 'complete')),
  completed_steps text[] not null default '{}',
  draft_data jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  check ((current_step = 'complete') = (completed_at is not null))
);

create trigger user_taste_objects_set_updated_at before update on public.user_taste_objects
for each row execute function private.set_updated_at();
create trigger onboarding_sessions_set_updated_at before update on public.onboarding_sessions
for each row execute function private.set_updated_at();

alter table public.taste_categories enable row level security;
alter table public.taste_objects enable row level security;
alter table public.user_taste_objects enable row level security;
alter table public.onboarding_sessions enable row level security;

create policy taste_categories_read_authenticated on public.taste_categories
for select to authenticated using (true);
create policy taste_objects_read_authenticated on public.taste_objects
for select to authenticated using (
  provider <> 'manual' or exists (
    select 1 from public.user_taste_objects shelf
    where shelf.taste_object_id = taste_objects.id and shelf.user_id = auth.uid()
  )
);
create policy user_taste_objects_select_own on public.user_taste_objects
for select to authenticated using (user_id = auth.uid());
create policy user_taste_objects_update_own on public.user_taste_objects
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_taste_objects_delete_own on public.user_taste_objects
for delete to authenticated using (user_id = auth.uid());
create policy onboarding_sessions_select_own on public.onboarding_sessions
for select to authenticated using (user_id = auth.uid());
create policy onboarding_sessions_insert_own on public.onboarding_sessions
for insert to authenticated with check (user_id = auth.uid());
create policy onboarding_sessions_update_own on public.onboarding_sessions
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.add_manual_taste_object(
  p_category text,
  p_title text,
  p_creator_name text,
  p_relationship_type text,
  p_emotional_meaning text default null
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
  if not exists (select 1 from public.taste_categories where id = p_category) then
    raise exception 'unsupported taste category' using errcode = '22023';
  end if;
  if char_length(trim(p_title)) not between 1 and 180 then
    raise exception 'title must contain 1 to 180 characters' using errcode = '22023';
  end if;
  if p_creator_name is not null and char_length(trim(p_creator_name)) > 180 then
    raise exception 'creator name is too long' using errcode = '22023';
  end if;
  if p_emotional_meaning is not null and char_length(p_emotional_meaning) > 1000 then
    raise exception 'emotional meaning is too long' using errcode = '22023';
  end if;

  insert into public.taste_objects(category, provider, title, creator_name)
  values (p_category, 'manual', trim(p_title), nullif(trim(p_creator_name), ''))
  returning id into v_object_id;

  insert into public.user_taste_objects(user_id, taste_object_id, relationship_type, emotional_meaning)
  values (v_user_id, v_object_id, p_relationship_type, nullif(trim(p_emotional_meaning), ''))
  returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.remove_shelf_item(p_shelf_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_object_id uuid;
begin
  if v_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  delete from public.user_taste_objects
  where id = p_shelf_item_id and user_id = v_user_id
  returning taste_object_id into v_object_id;
  if v_object_id is null then raise exception 'shelf item not found' using errcode = 'P0002'; end if;
  delete from public.taste_objects object
  where object.id = v_object_id and object.provider = 'manual'
    and not exists (select 1 from public.user_taste_objects shelf where shelf.taste_object_id = object.id);
end;
$$;

revoke all on public.taste_categories, public.taste_objects, public.user_taste_objects, public.onboarding_sessions from anon;
grant select on public.taste_categories, public.taste_objects to authenticated;
grant select, update on public.user_taste_objects to authenticated;
grant select, insert, update on public.onboarding_sessions to authenticated;
revoke all on function public.add_manual_taste_object(text,text,text,text,text) from public, anon;
grant execute on function public.add_manual_taste_object(text,text,text,text,text) to authenticated;
revoke all on function public.remove_shelf_item(uuid) from public, anon;
grant execute on function public.remove_shelf_item(uuid) to authenticated;

commit;
