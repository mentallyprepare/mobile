'use strict';

// Star placement is pure logic with a stated invariant: a given user's sky must
// be identical on every visit. Run: npm run test:sky

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-sky-test-'));
const SRC = path.resolve(__dirname, '..', 'src');
execFileSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'), path.join(SRC, 'sky.ts'),
   '--outDir', OUT, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { stdio: 'pipe', cwd: OUT }
);

const { starPositions, seeded, eveningFraction } = require(path.join(OUT, 'sky.js'));

const BOUNDS = { width: 320, height: 440 };
const entry = (day, iso) => ({ day, created_at: iso });

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('the same user gets the identical sky every time', () => {
  const entries = [entry(1, '2026-07-01T21:10:00'), entry(2, '2026-07-02T23:40:00')];
  const a = starPositions(entries, 42, BOUNDS);
  const b = starPositions(entries, 42, BOUNDS);
  assert.deepStrictEqual(a, b, 'positions must be stable across renders');
});

test('different users get different skies', () => {
  const entries = [entry(3, '2026-07-03T20:00:00')];
  const a = starPositions(entries, 1, BOUNDS);
  const b = starPositions(entries, 2, BOUNDS);
  assert.notDeepStrictEqual(a, b);
});

test('x advances with the night number', () => {
  const entries = [entry(1, '2026-07-01T21:00:00'), entry(21, '2026-07-21T21:00:00')];
  const [first, last] = starPositions(entries, 7, BOUNDS);
  assert.ok(last.x > first.x, 'night 21 sits to the right of night 1');
});

test('entries are ordered by night regardless of input order', () => {
  const entries = [entry(5, '2026-07-05T21:00:00'), entry(2, '2026-07-02T21:00:00')];
  const stars = starPositions(entries, 3, BOUNDS);
  assert.deepStrictEqual(stars.map((s) => s.day), [2, 5]);
});

test('an earlier evening sits higher than a later one', () => {
  // Same night, same seed: only the seal time differs.
  const early = starPositions([entry(4, '2026-07-04T18:30:00')], 9, BOUNDS)[0];
  const late = starPositions([entry(4, '2026-07-04T01:30:00')], 9, BOUNDS)[0];
  assert.ok(early.y < late.y, 'earlier evening = smaller y = higher in the sky');
});

test('stars stay inside the canvas', () => {
  const entries = Array.from({ length: 21 }, (_, i) =>
    entry(i + 1, `2026-07-${String(i + 1).padStart(2, '0')}T${i % 2 ? '18' : '01'}:15:00`)
  );
  for (const s of starPositions(entries, 12345, BOUNDS)) {
    assert.ok(s.x >= 0 && s.x <= BOUNDS.width, `x in range for night ${s.day}`);
    assert.ok(s.y >= 0 && s.y <= BOUNDS.height, `y in range for night ${s.day}`);
  }
});

test('seeded() is deterministic and within 0..1', () => {
  assert.strictEqual(seeded(5, 3), seeded(5, 3));
  for (const [u, d] of [[1, 1], [999, 21], [0, 7]]) {
    const v = seeded(u, d);
    assert.ok(v >= 0 && v < 1, `seeded(${u},${d}) in range`);
  }
});

test('an unparseable timestamp does not produce NaN', () => {
  const [s] = starPositions([entry(1, 'not-a-date')], 4, BOUNDS);
  assert.ok(Number.isFinite(s.x) && Number.isFinite(s.y));
});

test('eveningFraction clamps rather than wrapping to the wrong end', () => {
  assert.ok(eveningFraction('2026-07-04T18:00:00') <= 0.01, '18:00 is the start');
  assert.ok(eveningFraction('2026-07-04T02:00:00') >= 0.99, '02:00 is the end');
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
  console.log(`\n${passed}/${tests.length} sky tests passed.`);
})();
