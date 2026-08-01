'use strict';

const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const {
  REPORT_CATEGORIES,
  canSubmitReport,
  canConfirmAccountDeletion,
} = require(path.join(OUT, 'safety/contracts.js'));

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('report categories cover core interpersonal harm without diagnosis', () => {
  assert.deepStrictEqual(
    REPORT_CATEGORIES.map((item) => item.value),
    ['harassment', 'sexual_pressure', 'threat', 'personal_information', 'other'],
  );
});

test('report requires a category and meaningful bounded detail', () => {
  assert.strictEqual(canSubmitReport(null, 'enough detail here'), false);
  assert.strictEqual(canSubmitReport('harassment', 'too short'), false);
  assert.strictEqual(
    canSubmitReport('harassment', 'They repeatedly pressured me after I said no.'),
    true,
  );
  assert.strictEqual(canSubmitReport('other', 'x'.repeat(501)), false);
});

test('account deletion requires both password and explicit DELETE confirmation', () => {
  assert.strictEqual(canConfirmAccountDeletion('', 'DELETE'), false);
  assert.strictEqual(canConfirmAccountDeletion('password', 'keep'), false);
  assert.strictEqual(canConfirmAccountDeletion('password', ' delete '), true);
});

(async () => {
  let passed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('ok   -', name);
      passed += 1;
    } catch (error) {
      console.error('FAIL -', name);
      console.error('      ', error.message);
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} safety tests passed.`);
})();
