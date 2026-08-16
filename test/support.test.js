'use strict';

// Crisis resources. These numbers are the one thing in the app where being
// wrong is worse than being absent, so they are pinned here against the live
// safety page at mymentallyprepare.com/safety. If that page changes, this
// test should fail first and be updated deliberately.
// Run: npm run test:support

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-support-test-'));
execFileSync(
  process.execPath,
  [
    require.resolve('typescript/bin/tsc'),
    path.join(root, 'src', 'safety', 'support.ts'),
    '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--noResolve',
  ],
  { stdio: 'pipe', cwd: OUT },
);

const {
  CRISIS_REGIONS,
  HELPLINE_DIRECTORY,
  SUPPORT_STATEMENT,
  dialable,
  allHelplineNumbers,
} = require(path.join(OUT, 'support.js'));

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// Verbatim from mymentallyprepare.com/safety, fetched 15 August 2026.
const PUBLISHED = {
  'Tele MANAS': ['14416', '1800 891 4416'],
  iCall: ['9152987821'],
  'Vandrevala Foundation': ['+91 9999 666 555'],
  '988 Suicide & Crisis Lifeline': ['988'],
  'Samaritans (UK & IE)': ['116 123'],
  'EU emergency number': ['112'],
};

test('every helpline matches the published safety page exactly', () => {
  const seen = {};
  for (const region of CRISIS_REGIONS) {
    for (const helpline of region.helplines) {
      seen[helpline.name] = helpline.numbers;
    }
  }
  assert.deepStrictEqual(
    seen,
    PUBLISHED,
    'the app and the safety page must not drift apart',
  );
});

test('the three regions the safety page names are all present', () => {
  assert.deepStrictEqual(
    CRISIS_REGIONS.map((r) => r.region),
    ['India', 'United States & Canada', 'United Kingdom, Ireland & Europe'],
  );
});

test('India comes first — it is the stated target audience', () => {
  assert.strictEqual(CRISIS_REGIONS[0].region, 'India');
});

test('every number can actually be dialled', () => {
  for (const number of allHelplineNumbers()) {
    const dial = dialable(number);
    assert.match(dial, /^\+?\d{3,}$/, `${number} does not reduce to a dialable string`);
  }
  assert.strictEqual(dialable('+91 9999 666 555'), '+919999666555');
  assert.strictEqual(dialable('1800 891 4416'), '18008914416');
  assert.strictEqual(dialable('116 123'), '116123');
});

test('there is a fallback for everyone outside the listed regions', () => {
  assert.strictEqual(HELPLINE_DIRECTORY.url, 'https://findahelpline.com');
  assert.match(HELPLINE_DIRECTORY.url, /^https:\/\//, 'never send someone to plain http');
});

test('the product never claims to be care it is not', () => {
  const claim = SUPPORT_STATEMENT.notAService;
  for (const word of ['therapy', 'counselling', 'emergency support', 'crisis line']) {
    assert.ok(claim.includes(word), `the disclaimer must name "${word}" explicitly`);
  }
  assert.ok(
    !/we will|we are here for you|we monitor|24\/7 support/i.test(claim),
    'no promise of watching over anyone',
  );
});

test('the statement never promises continuous monitoring', () => {
  const all = Object.values(SUPPORT_STATEMENT).join(' ');
  assert.ok(
    !/always watching|monitored continuously|we check every/i.test(all),
    'entries are private by default; do not imply otherwise',
  );
});

test('support is reachable from the screens where it is needed', () => {
  const reach = {
    'app/sign-in.tsx': 'the first screen, per the web putting help on every auth screen',
    'app/(tabs)/rooms.tsx': 'the writing screen',
    'app/safety-privacy.tsx': 'the safety surface',
    'app/report.tsx': 'after filing a report',
  };
  for (const [file, why] of Object.entries(reach)) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(source, /'\/support'/, `${file} must link to support — ${why}`);
  }
});

test('the support screen carries no atmosphere', () => {
  // Utility world: someone reaching this needs a number, not a mood.
  const screen = fs.readFileSync(path.join(root, 'app', 'support.tsx'), 'utf8');
  for (const forbidden of ['AppBackdrop', 'LinearGradient', 'Animated', 'CosmicScreen']) {
    assert.ok(
      !screen.includes(forbidden),
      `${forbidden} does not belong on a crisis screen`,
    );
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
  fs.rmSync(OUT, { recursive: true, force: true });
  console.log(`\n${passed}/${tests.length} support tests passed.`);
})();
