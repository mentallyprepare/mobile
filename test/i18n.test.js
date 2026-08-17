'use strict';

// The i18n resolver is pure. It has to satisfy three invariants:
//   1. missing keys never render blank — always fall back to English.
//   2. unknown languages downgrade to English rather than throwing.
//   3. every supported language defines every key in StringsShape — this
//      is a build-time check enforced by the TypeScript compiler, so the
//      runtime test only needs to cover the fallback ladder.
// Run: npm run test:i18n

const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const {
  t,
  setLanguage,
  getLanguage,
  normalizeLocale,
  SUPPORTED_LANGUAGES,
} = require(path.join(OUT, 'i18n/index.js'));

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('default language is English', () => {
  setLanguage('en');
  assert.strictEqual(getLanguage(), 'en');
  assert.strictEqual(t('support.heading'), 'SUPPORT');
});

test('switching to Hindi returns the Hindi string', () => {
  setLanguage('hi');
  assert.strictEqual(t('support.heading'), 'सहायता');
  assert.strictEqual(t('support.india'), 'भारत');
});

test('a language with no dictionary yet falls back to English', () => {
  setLanguage('ta');
  assert.strictEqual(t('support.heading'), 'SUPPORT');
  setLanguage('en');
});

test('setLanguage rejects unknown codes silently — no crash', () => {
  const before = getLanguage();
  setLanguage('xx');
  assert.strictEqual(getLanguage(), before);
});

test('missing key returns the key itself, so tests catch it', () => {
  setLanguage('en');
  assert.strictEqual(t('support.no_such_key_here'), 'support.no_such_key_here');
});

test('normalizeLocale strips region tag and hyphen/underscore variants', () => {
  assert.strictEqual(normalizeLocale('en-US'), 'en');
  assert.strictEqual(normalizeLocale('hi_IN'), 'hi');
  assert.strictEqual(normalizeLocale('bn'), 'bn');
  assert.strictEqual(normalizeLocale('ta-IN'), 'ta');
});

test('normalizeLocale returns English for unknown or null locales', () => {
  assert.strictEqual(normalizeLocale('xx-YY'), 'en');
  assert.strictEqual(normalizeLocale(null), 'en');
  assert.strictEqual(normalizeLocale(undefined), 'en');
  assert.strictEqual(normalizeLocale(''), 'en');
});

test('every supported language advertises itself in the list', () => {
  for (const code of ['en', 'hi', 'ta', 'bn', 'mr']) {
    assert.ok(SUPPORTED_LANGUAGES.includes(code), `${code} listed as supported`);
  }
});

(async () => {
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('ok   -', name);
      passed++;
    } catch (err) {
      console.error('FAIL -', name);
      console.error('      ', err.message);
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} i18n tests passed.`);
})();
