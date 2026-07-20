begin;
select plan(21);

select has_table('public', 'taste_categories', 'taste categories exist');
select has_table('public', 'taste_objects', 'canonical taste objects exist');
select has_table('public', 'user_taste_objects', 'user shelf exists');
select has_table('public', 'onboarding_sessions', 'resumable onboarding exists');
select ok((select relrowsecurity from pg_class where oid = 'public.taste_categories'::regclass), 'taste categories have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.taste_objects'::regclass), 'taste objects have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.user_taste_objects'::regclass), 'user shelf has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.onboarding_sessions'::regclass), 'onboarding sessions have RLS');
select ok(not has_table_privilege('authenticated', 'public.taste_objects', 'insert'), 'client cannot write canonical objects directly');
select ok(not has_table_privilege('authenticated', 'public.user_taste_objects', 'insert'), 'shelf insertion requires trusted function');
select ok(not has_table_privilege('authenticated', 'public.user_taste_objects', 'delete'), 'shelf deletion requires trusted cleanup');
select ok(has_function_privilege('authenticated', 'public.add_manual_taste_object(text,text,text,text,text)', 'execute'), 'authenticated user can add a validated manual object');
select ok(has_function_privilege('authenticated', 'public.remove_shelf_item(uuid)', 'execute'), 'authenticated user can request trusted shelf cleanup');
select is((select count(*) from public.taste_categories), 10::bigint, 'all initial categories are seeded');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'shelf-owner@example.test', '', now(), now()),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'shelf-stranger@example.test', '', now(), now());

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated"}', true);
select lives_ok($$select public.add_manual_taste_object('music','A real song','A real artist','comfort_object','It helps me slow down.')$$, 'owner can add a manual shelf object');
select is((select count(*) from public.user_taste_objects), 1::bigint, 'owner sees the new shelf object');
select is((select visibility from public.user_taste_objects limit 1), 'private', 'new shelf objects default to private');
select is((select use_for_matching from public.user_taste_objects limit 1), false, 'new shelf objects default out of matching');
select lives_ok($$insert into public.onboarding_sessions(user_id, current_step, completed_steps, draft_data) values ('00000000-0000-0000-0000-000000000201','music_selection',array['account','age_confirmation'],'{"musicSearch":"unfinished"}')$$, 'owner can persist onboarding progress');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000202","role":"authenticated"}', true);
select is((select count(*) from public.user_taste_objects), 0::bigint, 'unrelated user cannot read the owner shelf');
select is((select count(*) from public.taste_objects), 0::bigint, 'unrelated user cannot read an owner-created manual object');

select * from finish();
rollback;
