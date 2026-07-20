begin;

alter table public.profiles
  add column profile_visibility text not null default 'private' check (profile_visibility in ('private', 'connections', 'profile')),
  add column discovery_enabled boolean not null default false,
  add column onboarding_completed boolean not null default false;

create or replace function public.complete_initial_account_setup(
  p_anonymous_name text,
  p_age_confirmed boolean,
  p_terms_accepted boolean,
  p_privacy_accepted boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not coalesce(p_age_confirmed, false) then
    raise exception '18+ confirmation is required' using errcode = '22023';
  end if;
  if not coalesce(p_terms_accepted, false) or not coalesce(p_privacy_accepted, false) then
    raise exception 'terms and privacy acknowledgement are required' using errcode = '22023';
  end if;
  if char_length(trim(p_anonymous_name)) not between 2 and 40 then
    raise exception 'display name must contain 2 to 40 characters' using errcode = '22023';
  end if;

  insert into public.profiles(user_id, anonymous_name)
  values (v_user_id, trim(p_anonymous_name))
  on conflict (user_id) do update set anonymous_name = excluded.anonymous_name
  returning * into v_profile;

  if not exists (
    select 1 from public.consent_records
    where user_id = v_user_id
      and policy_version = 'mp-foundation-2026-07-20'
      and event_type = 'granted'
      and age_confirmed and terms_accepted and privacy_accepted
  ) then
    insert into public.consent_records(
      user_id, policy_version, age_confirmed, terms_accepted,
      privacy_accepted, research_consent, event_type
    ) values (
      v_user_id, 'mp-foundation-2026-07-20', true, true, true, false, 'granted'
    );
  end if;

  insert into public.onboarding_sessions(user_id, current_step, completed_steps, draft_data)
  values (
    v_user_id,
    'social_intention',
    array['account', 'age_confirmation', 'display_identity'],
    '{}'::jsonb
  )
  on conflict (user_id) do update set
    current_step = case
      when onboarding_sessions.current_step in ('account', 'age_confirmation', 'display_identity') then 'social_intention'
      else onboarding_sessions.current_step
    end,
    completed_steps = (
      select array_agg(distinct step order by step)
      from unnest(onboarding_sessions.completed_steps || array['account', 'age_confirmation', 'display_identity']) step
    );

  return v_profile;
end;
$$;

revoke all on function public.complete_initial_account_setup(text,boolean,boolean,boolean) from public, anon;
grant execute on function public.complete_initial_account_setup(text,boolean,boolean,boolean) to authenticated;

commit;
