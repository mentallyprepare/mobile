'use strict';

// The writing screen is the product. These checks hold the two things that
// made it unusable with a keyboard open: nothing reserved space for the
// absolutely-positioned tab bar, and the sheet had no keyboard avoidance.
// Run: npm run test:keyboard

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-tabbar-test-'));
execFileSync(
  process.execPath,
  [
    require.resolve('typescript/bin/tsc'),
    path.join(root, 'src', 'design', 'chrome.ts'),
    '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck',
    '--noResolve',
  ],
  { stdio: 'pipe', cwd: OUT },
);
const { TAB_BAR_CONTENT_HEIGHT, tabBarHeightFor } = require(path.join(OUT, 'chrome.js'));

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('the tab bar reserves the device inset as well as its own height', () => {
  assert.strictEqual(tabBarHeightFor(0), TAB_BAR_CONTENT_HEIGHT, 'no inset, no extra');
  assert.strictEqual(
    tabBarHeightFor(48),
    TAB_BAR_CONTENT_HEIGHT + 48,
    'a gesture pill must not overlap the bar',
  );
});

test('a missing or negative inset never shrinks the bar', () => {
  assert.strictEqual(tabBarHeightFor(undefined), TAB_BAR_CONTENT_HEIGHT);
  assert.strictEqual(tabBarHeightFor(-20), TAB_BAR_CONTENT_HEIGHT);
});

test('the tab bar height is derived, not hard-coded', () => {
  const layout = read('app', '(tabs)', '_layout.tsx');
  assert.match(
    layout,
    /TAB_BAR_CONTENT_HEIGHT \+ insets\.bottom/,
    'the bar must add the safe-area inset to its own height',
  );
  assert.doesNotMatch(
    layout,
    /height:\s*72\b/,
    'the bar must not restate its height as a literal',
  );
});

test('screens reserve space from the same source as the bar', () => {
  const screen = read('src', 'components', 'app', 'CosmicScreen.tsx');
  assert.match(screen, /useTabBarHeight\(\)/, 'clearance comes from the shared hook');
  assert.doesNotMatch(
    screen,
    /paddingBottom:\s*132/,
    'the old magic number tuned to one device is gone',
  );
});

test('the writing screen lifts its content above the keyboard', () => {
  const rooms = read('app', '(tabs)', 'rooms.tsx');
  assert.match(rooms, /avoidKeyboard=\{!sealedTonight\}/, 'editor screens avoid the keyboard');
  assert.match(rooms, /scrollRef=\{scrollRef\}/, 'the sheet can be scrolled into view');
  assert.match(rooms, /onFocus=\{revealEditor\}/, 'focusing the editor reveals the seal control');
});

test('keyboard avoidance never discards what has been typed', () => {
  const screen = read('src', 'components', 'app', 'CosmicScreen.tsx');
  assert.match(
    screen,
    /keyboardShouldPersistTaps="handled"/,
    'a tap outside dismisses the keyboard without clearing the field',
  );
  const rooms = read('app', '(tabs)', 'rooms.tsx');
  assert.doesNotMatch(
    rooms,
    /Keyboard\.dismiss\(\)[\s\S]{0,80}setDraft\(''\)/,
    'dismissing the keyboard must never be wired to clearing the draft',
  );
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
  console.log(`\n${passed}/${tests.length} keyboard clearance tests passed.`);
})();
