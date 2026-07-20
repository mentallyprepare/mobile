-- Run by `supabase test db` after `supabase db reset`.
-- This suite intentionally uses transaction-local JWT claims so each query is
-- evaluated as an untrusted mobile caller.
begin;
select plan(8);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@example.test', '', now(), now()),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'partner@example.test', '', now(), now()),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stranger@example.test', '', now(), now());

insert into public.profiles(user_id, anonymous_name) values
  ('00000000-0000-0000-0000-000000000101', 'owner'),
  ('00000000-0000-0000-0000-000000000102', 'partner'),
  ('00000000-0000-0000-0000-000000000103', 'stranger');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000101","role":"authenticated"}', true);

select is((select count(*) from public.profiles), 1::bigint, 'owner sees only own profile');
select lives_ok($$insert into public.consent_records(user_id, policy_version, age_confirmed, terms_accepted, privacy_accepted, event_type) values ('00000000-0000-0000-0000-000000000101','test-v1',true,true,true,'granted')$$, 'owner can append own consent');
select throws_ok($$insert into public.consent_records(user_id, policy_version, age_confirmed, terms_accepted, privacy_accepted, event_type) values ('00000000-0000-0000-0000-000000000102','test-v1',true,true,true,'granted')$$, '42501', null, 'owner cannot append another user consent');
select throws_ok($$insert into public.sealed_entries(ritual_id,author_id,night,content,source_draft_id,idempotency_key) values (gen_random_uuid(),'00000000-0000-0000-0000-000000000101',1,'private',gen_random_uuid(),gen_random_uuid())$$, '42501', null, 'client cannot insert sealed writing');
select throws_ok($$insert into public.partner_presence(ritual_id,user_id,night,has_sealed) values (gen_random_uuid(),'00000000-0000-0000-0000-000000000101',1,true)$$, '42501', null, 'client cannot forge presence');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000103","role":"authenticated"}', true);
select is((select count(*) from public.profiles), 1::bigint, 'unrelated user sees only own profile');
select is((select count(*) from public.consent_records), 0::bigint, 'unrelated user cannot see owner consent');

reset role;
set local role anon;
select throws_ok(
  $$select count(*) from public.daily_prompts$$,
  '42501',
  null,
  'anonymous caller cannot read prompts'
);

select * from finish();
rollback;
