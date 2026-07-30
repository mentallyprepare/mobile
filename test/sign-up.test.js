'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-sign-up-test-'));
const SOURCE = path.resolve(__dirname, '..', 'src', 'auth', 'sign-up.ts');
execFileSync(
  process.execPath,
  [
    require.resolve('typescript/bin/tsc'),
    SOURCE,
    '--outDir',
    OUT,
    '--module',
    'commonjs',
    '--target',
    'es2020',
    '--skipLibCheck',
  ],
  { stdio: 'pipe', cwd: OUT },
);

const {
  accountStepError,
  consentStepError,
  isExistingAccountStatus,
  profileStepError,
} = require(path.join(OUT, 'sign-up.js'));

const valid = {
  name: 'Riya',
  email: 'riya@example.com',
  password: 'eightchars',
  passwordConfirmation: 'eightchars',
  college: 'Delhi University',
  year: '2nd',
  gender: 'female',
  matchGenderPref: 'any',
  ageConfirmed: true,
  consentGiven: true,
};

assert.strictEqual(accountStepError(valid), null);
assert.match(accountStepError({ ...valid, email: 'wrong' }), /valid email/i);
assert.strictEqual(profileStepError(valid), null);
assert.match(profileStepError({ ...valid, college: 'x' }), /college/i);
assert.strictEqual(consentStepError(valid), null);
assert.match(consentStepError({ ...valid, ageConfirmed: false }), /18 or older/i);
assert.strictEqual(isExistingAccountStatus(409), true);
assert.strictEqual(isExistingAccountStatus(400), false);

fs.rmSync(OUT, { recursive: true, force: true });
console.log('8/8 sign-up contract checks passed.');
