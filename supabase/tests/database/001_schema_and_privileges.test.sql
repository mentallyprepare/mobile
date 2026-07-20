begin;
select plan(20);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'writing_drafts', 'writing_drafts exists');
select has_table('public', 'sealed_entries', 'sealed_entries exists');
select has_table('public', 'partner_presence', 'partner_presence exists');
select has_table('private', 'matches', 'canonical matches are private');
select has_table('private', 'report_evidence', 'report evidence is private');

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.writing_drafts'::regclass), 'drafts have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.sealed_entries'::regclass), 'sealed entries have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.partner_presence'::regclass), 'presence has RLS');
select ok((select relrowsecurity from pg_class where oid = 'private.matches'::regclass), 'private matches have RLS');
select ok((select relrowsecurity from pg_class where oid = 'private.audit_events'::regclass), 'audit events have RLS');

select ok(has_table_privilege('authenticated', 'public.writing_drafts', 'select'), 'authenticated can select drafts through RLS');
select ok(not has_table_privilege('authenticated', 'public.writing_drafts', 'insert'), 'draft inserts require trusted RPC');
select ok(not has_table_privilege('authenticated', 'public.sealed_entries', 'insert'), 'sealed inserts require trusted RPC');
select ok(not has_table_privilege('authenticated', 'public.partner_presence', 'insert'), 'presence cannot be forged directly');
select ok(not has_table_privilege('authenticated', 'private.matches', 'select'), 'canonical matches are not client-readable');
select ok(not has_table_privilege('authenticated', 'private.report_evidence', 'select'), 'report evidence is not client-readable');
select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anonymous role has no profile access');
select ok(has_function_privilege('authenticated', 'public.seal_entry(uuid,uuid)', 'execute'), 'authenticated can call trusted seal RPC');

select * from finish();
rollback;
