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

test('the ECP-11 display copy switches language without changing its contract keys', () => {
  setLanguage('hi');
  assert.strictEqual(
    t('scan.q1_text'),
    'दूसरों के साथ अपनी असली भावनाएँ साझा करना मेरे लिए आसान है।',
  );
  assert.strictEqual(t('scan.scale_7'), 'पूरी तरह सहमत');
  setLanguage('en');
  assert.strictEqual(
    t('scan.q1_text'),
    "I find it easy to share what I'm really feeling with others.",
  );
});

test('the shelf editor localizes labels and privacy copy', () => {
  setLanguage('hi');
  assert.strictEqual(t('shelf_editor.song_a_label'), 'एक गीत');
  assert.match(t('shelf_editor.memory_note'), /निजी/);
  setLanguage('en');
});

test('tab bar labels translate — the highest-frequency strings in the app', () => {
  setLanguage('en');
  assert.strictEqual(t('tabs.home'), 'Home');
  assert.strictEqual(t('tabs.journey'), 'Journey');
  assert.strictEqual(t('tabs.shelf'), 'Shelf');
  setLanguage('hi');
  assert.strictEqual(t('tabs.journey'), 'यात्रा');
  assert.strictEqual(t('tabs.you'), 'तुम');
  setLanguage('en');
});

test('journey tab copy and locked-night notice compose in both languages', () => {
  setLanguage('en');
  assert.strictEqual(t('journey.title'), 'The nights you have carried.');
  assert.strictEqual(
    `${t('journey.locked_prefix')}5${t('journey.locked_suffix')}`,
    'Night 5 opens when it arrives.',
  );
  setLanguage('hi');
  assert.strictEqual(
    `${t('journey.locked_prefix')}5${t('journey.locked_suffix')}`,
    'रात 5 जब आएगी, तब खुलेगी।',
  );
  setLanguage('en');
});

test('the not-found route localizes headline, detail, and CTA', () => {
  setLanguage('hi');
  assert.match(t('not_found.headline'), /पन्ना/);
  assert.strictEqual(t('not_found.cta'), 'होम पर जाओ');
  setLanguage('en');
  assert.strictEqual(t('not_found.cta'), 'Go home');
});

test('load-state chrome (retry, stale, placeholder) translates', () => {
  setLanguage('en');
  assert.strictEqual(t('load_state.retry'), 'Try again');
  assert.strictEqual(t('load_state.stale_retry'), 'Retry');
  setLanguage('hi');
  assert.strictEqual(t('load_state.retry'), 'फिर से कोशिश करो');
  assert.match(t('load_state.stale_retry_a11y'), /ताज़ा/);
  setLanguage('en');
});

test('failure copy translates and keeps the "nothing removed" promise in Hindi', () => {
  setLanguage('hi');
  // Each detail line must still reassure that nothing has been removed —
  // that's the load-failure contract, not a stylistic choice.
  for (const kind of ['timeout', 'offline', 'auth', 'server', 'request', 'schema', 'unknown']) {
    const detail = t(`failures.${kind}_detail`);
    assert.match(
      detail,
      /हट|मौजूदा जानकारी/,
      `${kind} detail must still say nothing was removed / existing info intact`,
    );
  }
  assert.match(t('failures.stale_offline'), /पिछला सेव/);
  setLanguage('en');
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
