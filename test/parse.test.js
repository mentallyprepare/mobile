'use strict';

// Runtime shape validation at the API boundary. If the server returns a shape
// the app doesn't expect, this is where it must fail — with a message that
// names the exact field — rather than crashing a screen at render time.
// Run: npm run test:parse

const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const parse = require(path.join(OUT, 'api/parse.js'));
const { parseMe } = require(path.join(OUT, 'api/parse-me.js'));
const {
  parseOkResponse,
  parseShelfItemResponse,
  parseShelfList,
} = require(path.join(OUT, 'api/parse-shelf.js'));

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// A shape a screen would consume, with every field the app reads populated.
// Kept as a helper because failure tests spread from this and mutate one thing.
function goodMe() {
  return {
    user: {
      id: 42,
      name: 'Anya',
      email: 'a@example.com',
      college: 'Delhi University',
      year: '2nd',
      emailVerified: true,
      archetype: 'connector',
    },
    match: {
      id: 7,
      day: 9,
      currentPrompt: 'What are you carrying?',
      partner: { archetype: 'protector' },
      startedAt: '2026-07-01T21:00:00Z',
    },
    entries: [
      { day: 1, text: 'first', mood: null, created_at: '2026-07-01T21:00:00Z' },
      { day: 2, text: 'second', mood: 'quiet', created_at: '2026-07-02T21:10:00Z' },
    ],
    partnerEntries: [{ day: 1, created_at: '2026-07-01T22:00:00Z' }],
    partnerStatus: {
      hasPartner: true,
      partnerHasWrittenToday: false,
      nextUnsealAt: '2026-07-02T21:00:00Z',
      canSwitch: true,
      switchesRemaining: 2,
      status: 'active',
    },
    streak: 3,
  };
}

// --- primitives ----------------------------------------------------------

test('asString accepts strings and rejects everything else', () => {
  assert.strictEqual(parse.asString('hi', 'x'), 'hi');
  for (const bad of [null, undefined, 5, {}, [], true]) {
    assert.throws(() => parse.asString(bad, 'x.name'), parse.SchemaError);
  }
});

test('asNumber rejects NaN and Infinity, not just non-numbers', () => {
  assert.strictEqual(parse.asNumber(0, 'x'), 0);
  assert.strictEqual(parse.asNumber(-5, 'x'), -5);
  for (const bad of [NaN, Infinity, -Infinity, '5', null]) {
    assert.throws(() => parse.asNumber(bad, 'x'), parse.SchemaError);
  }
});

test('asBoolean is strict — 0 and "" are not booleans', () => {
  assert.strictEqual(parse.asBoolean(true, 'x'), true);
  assert.strictEqual(parse.asBoolean(false, 'x'), false);
  for (const bad of [0, 1, '', 'true', null, undefined]) {
    assert.throws(() => parse.asBoolean(bad, 'x'), parse.SchemaError);
  }
});

test('asObject rejects arrays and null', () => {
  assert.deepStrictEqual(parse.asObject({ a: 1 }, 'x'), { a: 1 });
  for (const bad of [null, undefined, [], 'x', 5]) {
    assert.throws(() => parse.asObject(bad, 'x'), parse.SchemaError);
  }
});

test('nullable passes null through, everything else through the inner parser', () => {
  const parser = parse.nullable(parse.asString);
  assert.strictEqual(parser(null, 'x'), null);
  assert.strictEqual(parser(undefined, 'x'), null);
  assert.strictEqual(parser('hi', 'x'), 'hi');
  assert.throws(() => parser(5, 'x'), parse.SchemaError);
});

test('field names the offending path so the failure is locatable', () => {
  try {
    parse.field({ email: 5 }, 'user', 'email', parse.asString);
    assert.fail('should have thrown');
  } catch (err) {
    assert.ok(err instanceof parse.SchemaError);
    assert.strictEqual(err.path, 'user.email');
    assert.match(err.message, /user\.email/);
  }
});

test('arrayOf names the offending index', () => {
  try {
    parse.arrayOf([1, 2, 'oops'], 'nums', parse.asNumber);
    assert.fail('should have thrown');
  } catch (err) {
    assert.strictEqual(err.path, 'nums[2]');
  }
});

// --- parseMe -------------------------------------------------------------

test('parseMe returns a well-formed response unchanged, shape-wise', () => {
  const good = goodMe();
  const result = parseMe(good);
  assert.deepStrictEqual(result, good);
});

test('parseMe accepts a null match (no active partner)', () => {
  const good = goodMe();
  good.match = null;
  const result = parseMe(good);
  assert.strictEqual(result.match, null);
});

test('parseMe accepts a match with null partner archetype', () => {
  const good = goodMe();
  good.match.partner = { archetype: null };
  assert.doesNotThrow(() => parseMe(good));
});

test('parseMe rejects a missing user.email with the exact path', () => {
  const bad = goodMe();
  delete bad.user.email;
  try {
    parseMe(bad);
    assert.fail('should have thrown');
  } catch (err) {
    assert.ok(err instanceof parse.SchemaError);
    assert.strictEqual(err.path, 'user.email');
  }
});

test('parseMe rejects a partnerStatus with the wrong shape at that path', () => {
  const bad = goodMe();
  bad.partnerStatus.canSwitch = 'yes'; // string, not boolean
  try {
    parseMe(bad);
    assert.fail('should have thrown');
  } catch (err) {
    assert.strictEqual(err.path, 'partnerStatus.canSwitch');
  }
});

test('parseMe reports the offending entry index, not just "entries"', () => {
  const bad = goodMe();
  bad.entries[1].day = '2'; // string instead of number
  try {
    parseMe(bad);
    assert.fail('should have thrown');
  } catch (err) {
    assert.strictEqual(err.path, 'entries[1].day');
  }
});

test('parseMe rejects entirely missing top-level fields', () => {
  const bad = goodMe();
  delete bad.streak;
  assert.throws(() => parseMe(bad), parse.SchemaError);
});

test('parseMe tolerates extra server fields (superset ok)', () => {
  const good = goodMe();
  good.experimentalFlag = 'ignored';
  good.user.internalId = 999;
  assert.doesNotThrow(() => parseMe(good));
});

// --- parseShelf ----------------------------------------------------------

function goodShelfItem() {
  return {
    kind: 'song_a',
    title: 'Lover, You Should\'ve Come Over',
    detail: 'Jeff Buckley',
    artworkUrl: null,
    updatedAt: '2026-07-01T21:00:00Z',
  };
}

test('parseShelfList accepts an empty list', () => {
  assert.deepStrictEqual(parseShelfList({ items: [] }), { items: [] });
});

test('parseShelfList validates each item and names the bad one', () => {
  const bad = { items: [goodShelfItem(), { ...goodShelfItem(), title: null }] };
  try {
    parseShelfList(bad);
    assert.fail('should have thrown');
  } catch (err) {
    assert.strictEqual(err.path, 'items[1].title');
  }
});

test('parseShelfList rejects an unknown kind so a rename cannot ship unseen', () => {
  const bad = { items: [{ ...goodShelfItem(), kind: 'album' }] };
  try {
    parseShelfList(bad);
    assert.fail('should have thrown');
  } catch (err) {
    assert.strictEqual(err.path, 'items[0].kind');
    assert.match(err.message, /unknown shelf kind: album/);
  }
});

test('parseShelfItemResponse returns ok + item', () => {
  const result = parseShelfItemResponse({ ok: true, item: goodShelfItem() });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.item.kind, 'song_a');
});

test('parseOkResponse returns just ok', () => {
  assert.deepStrictEqual(parseOkResponse({ ok: true }), { ok: true });
  assert.throws(() => parseOkResponse({}), parse.SchemaError);
});

// --- run -----------------------------------------------------------------

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
  console.log(`\n${passed}/${tests.length} parse tests passed.`);
})();
