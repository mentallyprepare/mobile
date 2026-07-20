'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const migrationDirectory = path.join(root, 'supabase', 'migrations');
const migration = fs.readdirSync(migrationDirectory).filter((name) => name.endsWith('.sql')).sort()
  .map((name) => fs.readFileSync(path.join(migrationDirectory, name), 'utf8')).join('\n');
const client = fs.readFileSync(path.join(root, 'src', 'backend', 'client.ts'), 'utf8');
const config = fs.readFileSync(path.join(root, 'src', 'backend', 'config.ts'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'verify.yml'), 'utf8');
const musicCatalog = fs.readFileSync(path.join(root, 'supabase', 'functions', 'music-catalog', 'index.ts'), 'utf8');
const mobileHome = fs.readFileSync(path.join(root, 'app', '(tabs)', 'index.tsx'), 'utf8');

test('every public user-data table enables RLS', () => {
  const required = [
    'profiles', 'consent_records', 'match_pool_entries', 'match_memberships', 'rituals',
    'writing_drafts', 'sealed_entries', 'partner_presence', 'reveal_artifacts',
    'reveal_decisions', 'identity_reveal_requests', 'blocks', 'reports', 'rematch_requests',
    'taste_categories', 'taste_objects', 'user_taste_objects', 'onboarding_sessions',
    'social_intentions', 'user_social_intentions', 'discovery_preferences',
  ];
  for (const table of required) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
});

test('taste identity starts private and uses a trusted catalog write', () => {
  assert.match(migration, /visibility text not null default 'private'/i);
  assert.match(migration, /use_for_matching boolean not null default false/i);
  assert.doesNotMatch(migration, /grant\s+insert\s+on\s+public\.taste_objects\s+to\s+authenticated/i);
  assert.doesNotMatch(migration, /grant\s+select,\s*update,\s*delete\s+on\s+public\.user_taste_objects/i);
  assert.match(migration, /grant execute on function public\.add_manual_taste_object/i);
  assert.match(migration, /grant execute on function public\.remove_shelf_item/i);
});

test('account creation requires explicit age and policy acknowledgement', () => {
  assert.match(migration, /complete_initial_account_setup/i);
  assert.match(migration, /18\+ confirmation is required/i);
  assert.match(migration, /terms and privacy acknowledgement are required/i);
  assert.match(migration, /profile_visibility text not null default 'private'/i);
  assert.match(migration, /discovery_enabled boolean not null default false/i);
  assert.doesNotMatch(migration, /grant execute on function public\.complete_initial_account_setup\([^\n]+\) to anon/i);
});

test('identity onboarding is server-gated and discovery defaults off', () => {
  assert.match(migration, /complete_identity_onboarding/i);
  assert.match(migration, /five artists are required/i);
  assert.match(migration, /five songs are required/i);
  assert.match(migration, /privacy_reviewed_at is null/i);
  assert.match(migration, /discovery_enabled = coalesce\(p_enable_discovery, false\)/i);
  assert.match(migration, /revoke update on public\.profiles from authenticated/i);
});

test('music provider data is fetched and verified server-side', () => {
  assert.match(musicCatalog, /itunes\.apple\.com\/search/);
  assert.match(musicCatalog, /itunes\.apple\.com\/lookup/);
  assert.match(musicCatalog, /caller\.auth\.getUser/);
  assert.match(musicCatalog, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(musicCatalog, /const\s+(songs|artists)\s*=\s*\[/i);
});

test('mobile home no longer routes completed users into Tonight', () => {
  assert.match(mobileHome, /YOUR FINITE EDITION/);
  assert.doesNotMatch(mobileHome, /getTonight|saveDraft|sealEntry/);
  assert.doesNotMatch(mobileHome, /const\s+(people|recommendations)\s*=\s*\[/i);
});

test('private writing and presence require trusted operations', () => {
  assert.doesNotMatch(migration, /grant\s+insert\s+on\s+public\.sealed_entries\s+to\s+authenticated/i);
  assert.doesNotMatch(migration, /grant\s+insert\s+on\s+public\.partner_presence\s+to\s+authenticated/i);
  assert.match(migration, /grant execute on function public\.seal_entry/i);
});

test('mobile configuration fails closed and contains no service-role key', () => {
  assert.match(config, /Backend is not configured/);
  assert.doesNotMatch(config + client, /service[_-]?role/i);
  assert.match(config, /SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(config + client, /mymentallyprepare\.com/i);
});

test('CI rebuilds the database and executes pgTAP before approval', () => {
  assert.match(workflow, /npm run db:verify/);
  assert.match(workflow, /supabase stop --no-backup/);
  assert.match(workflow, /actions\/checkout@v7/);
  assert.match(workflow, /actions\/setup-node@v7/);
  assert.doesNotMatch(workflow, /actions\/(checkout|setup-node)@v4/);
  assert.doesNotMatch(workflow, /SUPABASE_(ACCESS_TOKEN|DB_PASSWORD|SERVICE_ROLE)/);
});
