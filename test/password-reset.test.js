'use strict';

const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const {
  canRequestPasswordReset,
  normalizeResetCode,
  passwordResetValidation,
} = require(path.join(OUT, 'auth/password-reset.js'));

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

console.log('5/5 password reset contract checks passed.');
