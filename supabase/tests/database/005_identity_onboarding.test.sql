begin;
select plan(30);

select has_table('public', 'social_intentions', 'social intentions exist');
select has_table('public', 'user_social_intentions', 'user intentions exist');
select has_table('public', 'discovery_preferences', 'discovery preferences exist');
select ok((select relrowsecurity from pg_class where oid = 'public.social_intentions'::regclass), 'social intention catalog has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.user_social_intentions'::regclass), 'user intentions have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.discovery_preferences'::regclass), 'discovery preferences have RLS');
select ok(has_function_privilege('authenticated', 'public.add_manual_identity_object(text,text,text,text[])', 'execute'), 'authenticated user can use manual music fallback');
select ok(has_function_privilege('authenticated', 'public.complete_identity_onboarding(boolean)', 'execute'), 'authenticated user can request trusted completion');
select ok(not has_function_privilege('anon', 'public.add_manual_identity_object(text,text,text,text[])', 'execute'), 'anonymous caller cannot add identity objects');
select ok(not has_function_privilege('anon', 'public.complete_identity_onboarding(boolean)', 'execute'), 'anonymous caller cannot complete identity onboarding');
select ok(has_function_privilege('authenticated', 'public.reorder_identity_shelf(uuid[])', 'execute'), 'authenticated user can request trusted shelf reordering');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'identity-owner@example.test', '', now(), now()),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'identity-stranger@example.test', '', now(), now());

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000401","role":"authenticated"}', true);
select throws_ok($$update public.profiles set onboarding_completed = true where user_id = '00000000-0000-0000-0000-000000000401'$$, '42501', null, 'client cannot forge onboarding completion');
select lives_ok($$select public.complete_initial_account_setup('identity owner',true,true,true)$$, 'private account setup succeeds');
select lives_ok($$insert into public.user_social_intentions(user_id,intention_id) values ('00000000-0000-0000-0000-000000000401','shared_taste')$$, 'owner can select a social intention');
select lives_ok($$
  do $block$
  begin
    perform public.add_manual_identity_object('artist','Artist One',null,array['favourite_artist']);
    perform public.add_manual_identity_object('artist','Artist Two',null,array['favourite_artist']);
    perform public.add_manual_identity_object('artist','Artist Three',null,array['favourite_artist']);
    perform public.add_manual_identity_object('artist','Artist Four',null,array['favourite_artist']);
    perform public.add_manual_identity_object('artist','Artist Five',null,array['favourite_artist']);
    perform public.add_manual_identity_object('song','Song One','Artist One',array['favourite_song','current_song','comfort_song','feels_like_me']);
    perform public.add_manual_identity_object('song','Song Two','Artist Two',array['favourite_song']);
    perform public.add_manual_identity_object('song','Song Three','Artist Three',array['favourite_song']);
    perform public.add_manual_identity_object('song','Song Four','Artist Four',array['favourite_song']);
    perform public.add_manual_identity_object('song','Song Five','Artist Five',array['favourite_song']);
  end
  $block$;
$$, 'required music identity can be stored through trusted fallback');
select is((select count(*) from public.user_taste_objects), 10::bigint, 'ten unique music objects are stored');
select lives_ok($$select public.reorder_identity_shelf(array(select id from public.user_taste_objects order by created_at desc))$$, 'owner can reorder selected identity objects');
select is((select min(position) from public.user_taste_objects), 0, 'trusted reorder uses zero-based positions');
select throws_ok($$select public.add_manual_identity_object('artist','Artist One',null,array['favourite_artist'])$$, '23505', null, 'duplicate manual identity objects are rejected');
select throws_ok($$update public.user_taste_objects set identity_roles = array['current_song'] where id = (select shelf.id from public.user_taste_objects shelf join public.taste_objects object on object.id = shelf.taste_object_id where object.object_type = 'artist' limit 1)$$, '22023', null, 'database rejects song semantics on an artist');
select is((select count(*) from public.user_taste_objects where visibility = 'private'), 10::bigint, 'every selected object starts private');
select is((select count(*) from public.user_taste_objects where use_for_matching), 0::bigint, 'every selected object starts excluded from matching');
select lives_ok($$update public.user_taste_objects set privacy_reviewed_at = now(), personal_note = case when identity_roles @> array['current_song']::text[] then 'This is where I am right now.' else personal_note end where user_id = '00000000-0000-0000-0000-000000000401'$$, 'owner can review privacy and attach meaning');
select lives_ok($$select public.complete_identity_onboarding(false)$$, 'eligible identity onboarding completes server-side');
select is((select onboarding_completed from public.profiles), true, 'profile is marked complete');
select is((select profile_visibility from public.profiles), 'private', 'completed profile remains private by default');
select is((select discovery_enabled from public.profiles), false, 'discovery remains disabled by default');
select is((select current_step from public.onboarding_sessions), 'complete', 'authoritative onboarding stage is complete');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000402","role":"authenticated"}', true);
select is((select count(*) from public.user_social_intentions), 0::bigint, 'unrelated user cannot read intentions');
select is((select count(*) from public.discovery_preferences), 0::bigint, 'unrelated user cannot read discovery preferences');

select * from finish();
rollback;
