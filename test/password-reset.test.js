'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-password-reset-test-'));
const SOURCE = path.resolve(__dirname, '..', 'src', 'auth', 'password-reset.ts');
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
  canRequestPasswordReset,
  normalizeResetCode,
  passwordResetValidation,
} = require(path.join(OUT, 'password-reset.js'));

assert.strictEqual(canRequestPasswordReset('person@example.com'), true);
assert.strictEqual(canRequestPasswordReset('not-an-email'), false);
assert.strictEqual(normalizeResetCode(' ab c123 '), 'ABC123');
assert.match(
  passwordResetValidation({
    code: 'ABC123',
    password: 'eightchars',
    confirmation: 'different',
  }),
  /do not match/i,
);
assert.strictEqual(
  passwordResetValidation({
    code: 'ABC123',
    password: 'eightchars',
    confirmation: 'eightchars',
  }),
  null,
);

fs.rmSync(OUT, { recursive: true, force: true });
console.log('5/5 password reset contract checks passed.');
