'use strict';

// Proves the mobile ECP-11 produces the same axis scores and archetype as the
// web app for identical answers. If either side drifts, this test fails.
// Run: npm run test:quiz

const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const { QUESTIONS, scoreQuiz, SCALE_MIN, SCALE_MAX } = require(path.join(OUT, 'quiz.js'));

// The exact scoring rule from public/app.js — inlined so drift shows up here.
function webScore(answers) {
  const totals = { openness: 0, awareness: 0, guard: 0, reciprocity: 0 };
  const counts = { openness: 0, awareness: 0, guard: 0, reciprocity: 0 };
  QUESTIONS.forEach((q, idx) => {
    const val = answers[idx];
    const s = q.reverse ? 8 - val : val;
    totals[q.axis] += s;
    counts[q.axis] += 7;
  });
  const pct = (t, c) => (c ? Math.round((t / c) * 100) : 50);
  const scores = {
    openness: pct(totals.openness, counts.openness),
    awareness: pct(totals.awareness, counts.awareness),
    guard: pct(totals.guard, counts.guard),
    reciprocity: pct(totals.reciprocity, counts.reciprocity),
  };
  const { openness: o, awareness: a, guard: g } = scores;
  let archetype;
  if (g >= 60 && o < 50) archetype = 'protector';
  else if (o >= 55 && g < 50) archetype = 'connector';
  else if (g >= 50 && a >= 55) archetype = 'performer';
  else archetype = 'disconnector';
  return { scores, archetype };
}

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('there are exactly 11 questions', () => {
  assert.strictEqual(QUESTIONS.length, 11);
});

test('scoring matches the web app for all 7s', () => {
  const a = QUESTIONS.map(() => 7);
  const mine = scoreQuiz(a);
  const theirs = webScore(a);
  assert.deepStrictEqual(mine, theirs);
});

test('scoring matches the web app for all 1s', () => {
  const a = QUESTIONS.map(() => 1);
  assert.deepStrictEqual(scoreQuiz(a), webScore(a));
});

test('scoring matches the web app for all 4s (neutral)', () => {
  const a = QUESTIONS.map(() => 4);
  assert.deepStrictEqual(scoreQuiz(a), webScore(a));
});

test('reverse-scored items behave as advertised', () => {
  // Q5 and Q6 are reverse on the awareness axis. Answering 7 on those should
  // decrease awareness the same way answering 1 on forward items would.
  const highReverse = QUESTIONS.map((q) => (q.reverse ? 7 : 1));
  const highForward = QUESTIONS.map((q) => (q.reverse ? 1 : 7));
  const r1 = scoreQuiz(highReverse);
  const r2 = scoreQuiz(highForward);
  assert.ok(r2.scores.awareness > r1.scores.awareness, 'forward-high yields higher awareness');
});

test('classic protector profile: guarded, low openness', () => {
  const a = QUESTIONS.map((q) => {
    if (q.axis === 'guard') return 7;
    if (q.axis === 'openness') return 2;
    return 4;
  });
  const { archetype, scores } = scoreQuiz(a);
  assert.strictEqual(archetype, 'protector', JSON.stringify(scores));
  assert.deepStrictEqual(scoreQuiz(a), webScore(a));
});

test('classic connector profile: open, unguarded', () => {
  const a = QUESTIONS.map((q) => {
    if (q.axis === 'openness') return 7;
    if (q.axis === 'guard') return 2;
    return 5;
  });
  assert.strictEqual(scoreQuiz(a).archetype, 'connector');
  assert.deepStrictEqual(scoreQuiz(a), webScore(a));
});

test('performer profile: guarded and highly aware', () => {
  const a = QUESTIONS.map((q) => {
    if (q.axis === 'guard') return 6;
    if (q.axis === 'awareness') return q.reverse ? 2 : 6;
    return 4;
  });
  assert.strictEqual(scoreQuiz(a).archetype, 'performer');
  assert.deepStrictEqual(scoreQuiz(a), webScore(a));
});

test('disconnector as the fallback', () => {
  // All axes low: doesn't match protector (g not high), connector (o not
  // high), or performer (g and a not high) — falls through to disconnector.
  // Forward items answered 2, reverse items answered 6 => every axis lands
  // around 29%.
  const a = QUESTIONS.map((q) => (q.reverse ? 6 : 2));
  const { archetype, scores } = scoreQuiz(a);
  assert.strictEqual(archetype, 'disconnector', JSON.stringify(scores));
  // And it matches the web app on the same vector.
  assert.deepStrictEqual(scoreQuiz(a), webScore(a));
});

test('rejects any missing answer', () => {
  const a = QUESTIONS.map(() => 5);
  a[3] = null;
  assert.throws(() => scoreQuiz(a));
});

test('rejects out-of-range answers', () => {
  const a = QUESTIONS.map(() => 5);
  a[0] = 8;
  assert.throws(() => scoreQuiz(a));
});

test('SCALE_MIN and SCALE_MAX match the server contract', () => {
  assert.strictEqual(SCALE_MIN, 1);
  assert.strictEqual(SCALE_MAX, 7);
});

test('parity across 200 random vectors', () => {
  for (let i = 0; i < 200; i++) {
    const a = QUESTIONS.map(() => Math.floor(Math.random() * 7) + 1);
    assert.deepStrictEqual(scoreQuiz(a), webScore(a));
  }
});

(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); console.log('ok   -', name); passed++; }
    catch (err) { console.error('FAIL -', name); console.error('      ', err.message); process.exitCode = 1; }
  }
  console.log(`\n${passed}/${tests.length} quiz tests passed.`);
})();
