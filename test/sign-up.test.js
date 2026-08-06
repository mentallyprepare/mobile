'use strict';

const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const {
  accountStepError,
  consentStepError,
  isExistingAccountStatus,
  profileStepError,
} = require(path.join(OUT, 'auth/sign-up.js'));

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

console.log('8/8 sign-up contract checks passed.');
