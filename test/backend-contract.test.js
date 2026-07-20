'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const migration = fs.readFileSync(path.join(root, 'supabase', 'migrations', '202607200001_mp006_foundation.sql'), 'utf8');
const client = fs.readFileSync(path.join(root, 'src', 'backend', 'client.ts'), 'utf8');
const config = fs.readFileSync(path.join(root, 'src', 'backend', 'config.ts'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'verify.yml'), 'utf8');

test('every public user-data table enables RLS', () => {
  const required = [
    'profiles', 'consent_records', 'match_pool_entries', 'match_memberships', 'rituals',
    'writing_drafts', 'sealed_entries', 'partner_presence', 'reveal_artifacts',
    'reveal_decisions', 'identity_reveal_requests', 'blocks', 'reports', 'rematch_requests',
  ];
  for (const table of required) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
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
