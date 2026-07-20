begin;
select plan(12);

select ok(has_function_privilege('authenticated', 'public.complete_initial_account_setup(text,boolean,boolean,boolean)', 'execute'), 'authenticated user can complete initial setup');
select ok(not has_function_privilege('anon', 'public.complete_initial_account_setup(text,boolean,boolean,boolean)', 'execute'), 'anonymous caller cannot complete initial setup');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'new-account@example.test', '', now(), now()),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'other-account@example.test', '', now(), now());

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000301","role":"authenticated"}', true);
select throws_ok($$select public.complete_initial_account_setup('new moon',false,true,true)$$, '22023', null, 'age confirmation is required');
select throws_ok($$select public.complete_initial_account_setup('new moon',true,false,true)$$, '22023', null, 'terms acknowledgement is required');
select lives_ok($$insert into public.onboarding_sessions(user_id,current_step,completed_steps,draft_data) values ('00000000-0000-0000-0000-000000000301','display_identity',array['account','age_confirmation'],'{"displayName":"new moon"}')$$, 'display-name draft can be saved before completion');
select lives_ok($$select public.complete_initial_account_setup('new moon',true,true,true)$$, 'valid setup completes atomically');
select is((select count(*) from public.profiles), 1::bigint, 'setup creates the caller profile');
select is((select profile_visibility from public.profiles), 'private', 'profile defaults to private');
select is((select discovery_enabled from public.profiles), false, 'discovery defaults off');
select is((select count(*) from public.consent_records where event_type = 'granted'), 1::bigint, 'setup records one consent grant');
select is((select current_step from public.onboarding_sessions), 'social_intention', 'resumable onboarding advances to the next stage');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000302","role":"authenticated"}', true);
select is((select count(*) from public.profiles), 0::bigint, 'another user cannot read the new profile');

select * from finish();
rollback;
