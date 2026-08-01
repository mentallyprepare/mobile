'use strict';

// The splash is held until the brand faces are ready. These checks hold the
// rule that "ready" can never mean "never": a font that fails, and a font that
// simply never answers, both have to let the app start.
// Run: npm run test:font-gate

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const root = path.resolve(__dirname, '..');
const OUT = ensureBuilt();
const {
  fontGate,
  fontFailureNote,
  FONT_GATE_TIMEOUT_MS,
} = require(path.join(OUT, 'fonts/gate.js'));

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

const WAITING = { loaded: false, error: null, timedOut: false };

test('the brand faces are waited for while they are still coming', () => {
  const gate = fontGate(WAITING);
  assert.strictEqual(gate.ready, false);
  assert.strictEqual(gate.reason, 'waiting');
});

test('fonts that load keep the brand typography', () => {
  const gate = fontGate({ ...WAITING, loaded: true });
  assert.deepStrictEqual(gate, { ready: true, usingFallback: false, reason: 'loaded' });
});

test('a font that fails starts the app in system faces', () => {
  const gate = fontGate({ ...WAITING, error: new Error('asset 404') });
  assert.strictEqual(gate.ready, true, 'a font failure must never brick the install');
  assert.strictEqual(gate.usingFallback, true);
});

test('a font that never answers is bounded, not waited on forever', () => {
  const gate = fontGate({ ...WAITING, timedOut: true });
  assert.strictEqual(gate.ready, true, 'the splash must not be held indefinitely');
  assert.strictEqual(gate.reason, 'timeout');
});

test('a late success is still preferred over the fallback', () => {
  const gate = fontGate({ loaded: true, error: new Error('one face missed'), timedOut: true });
  assert.strictEqual(gate.usingFallback, false, 'loaded wins: keep the real typography');
});

test('the bound is short enough to be a bound', () => {
  assert.ok(FONT_GATE_TIMEOUT_MS > 0);
  assert.ok(
    FONT_GATE_TIMEOUT_MS <= 8000,
    'a ceiling nobody would sit through is not a ceiling',
  );
});

test('the failure note is technical and carries nothing personal', () => {
  const secret = 'the thing I could not say out loud today';
  const err = new Error(`failed while writing ${secret}`);
  err.name = 'FontLoadError';

  const note = fontFailureNote('error', err);
  assert.ok(note.includes('FontLoadError'), 'the error kind is useful and safe');
  assert.ok(!note.includes(secret), 'no error message text may reach the note');
  assert.ok(!note.includes('failed while writing'), 'the note is built, not copied');

  const timeoutNote = fontFailureNote('timeout');
  assert.ok(timeoutNote.includes(String(FONT_GATE_TIMEOUT_MS)));
});

test('nothing is recorded when the fonts are fine', () => {
  assert.strictEqual(fontFailureNote('loaded'), null);
  assert.strictEqual(fontFailureNote('waiting'), null);
});

test('a malformed error still produces a usable note', () => {
  for (const bad of [null, undefined, 'a string', 42, {}]) {
    const note = fontFailureNote('error', bad);
    assert.ok(typeof note === 'string' && note.length > 0);
  }
});

test('the root layout renders on the gate, not on loaded alone', () => {
  const layout = fs.readFileSync(path.join(root, 'app', '_layout.tsx'), 'utf8');
  assert.match(layout, /const fontsReady = gate\.ready/, 'the gate decides');
  assert.match(layout, /FONT_GATE_TIMEOUT_MS/, 'the bound is wired up');
  assert.doesNotMatch(
    layout,
    /const fontsReady = fontsLoaded(\s*\|\|\s*Boolean\(fontError\))?;/,
    'the unbounded gate is gone',
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
  console.log(`\n${passed}/${tests.length} font gate tests passed.`);
})();
