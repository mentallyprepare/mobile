'use strict';

// Unsealed writing is the most private thing in the product. These checks hold
// the four promises made about it: it survives a restart, it never crosses
// between accounts or nights, sealing removes it, and signing out clears it.
// Run: npm run test:drafts

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const {
  createDraftStore,
  draftFileName,
  isValidScope,
} = require(path.join(OUT, 'drafts/store.js'));

/** Stands in for the device filesystem, and can be told to fail. */
function memoryIO({ failing = false } = {}) {
  const files = new Map();
  const boom = () => {
    throw new Error('disk unavailable');
  };
  return {
    files,
    read: async (n) => (failing ? boom() : files.has(n) ? files.get(n) : null),
    write: async (n, c) => {
      if (failing) boom();
      files.set(n, c);
    },
    remove: async (n) => {
      if (failing) boom();
      files.delete(n);
    },
    list: async () => (failing ? boom() : [...files.keys()]),
  };
}

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

const ANNA = { userId: 7, night: 3 };
const NOTE = 'the thing I could not say out loud today';

test('a draft written tonight is still there after a restart', async () => {
  const io = memoryIO();
  const store = createDraftStore(io);
  await store.save(ANNA, NOTE);
  // A fresh store over the same storage is what a relaunch looks like.
  assert.strictEqual(await createDraftStore(io).load(ANNA), NOTE);
});

test('drafts never cross between accounts', async () => {
  const io = memoryIO();
  const store = createDraftStore(io);
  await store.save({ userId: 7, night: 3 }, 'mine');
  assert.strictEqual(
    await store.load({ userId: 8, night: 3 }),
    null,
    'another account on the same device must see nothing',
  );
});

test('drafts never cross between nights', async () => {
  const io = memoryIO();
  const store = createDraftStore(io);
  await store.save({ userId: 7, night: 3 }, 'night three');
  assert.strictEqual(await store.load({ userId: 7, night: 4 }), null);
  assert.strictEqual(await store.load({ userId: 7, night: 3 }), 'night three');
});

test('sealing the note removes the local copy', async () => {
  const io = memoryIO();
  const store = createDraftStore(io);
  await store.save(ANNA, NOTE);
  await store.discard(ANNA);
  assert.strictEqual(await store.load(ANNA), null);
  assert.strictEqual(io.files.size, 0, 'nothing is left on disk');
});

test('signing out clears every draft on the device', async () => {
  const io = memoryIO();
  const store = createDraftStore(io);
  await store.save({ userId: 7, night: 3 }, 'one');
  await store.save({ userId: 7, night: 4 }, 'two');
  await store.save({ userId: 9, night: 1 }, 'three');
  await store.discardAll();
  assert.strictEqual(io.files.size, 0, 'the next account sees nothing');
});

test('discardAll leaves unrelated files alone', async () => {
  const io = memoryIO();
  io.files.set('something-else.json', 'not ours');
  const store = createDraftStore(io);
  await store.save(ANNA, NOTE);
  await store.discardAll();
  assert.deepStrictEqual([...io.files.keys()], ['something-else.json']);
});

test('an unknown account is never written to disk', async () => {
  const io = memoryIO();
  const store = createDraftStore(io);
  for (const scope of [
    { userId: 0, night: 3 },
    { userId: -1, night: 3 },
    { userId: 7, night: 0 },
    { userId: 1.5, night: 3 },
    { userId: NaN, night: 3 },
  ]) {
    assert.strictEqual(isValidScope(scope), false, JSON.stringify(scope));
    assert.strictEqual(await store.save(scope, NOTE), false);
  }
  assert.strictEqual(io.files.size, 0, 'no shared bucket for unknown users');
});

test('emptying the editor removes the draft rather than storing blankness', async () => {
  const io = memoryIO();
  const store = createDraftStore(io);
  await store.save(ANNA, NOTE);
  await store.save(ANNA, '   \n  ');
  assert.strictEqual(io.files.size, 0);
});

test('a device that cannot write never stops the writing', async () => {
  const store = createDraftStore(memoryIO({ failing: true }));
  await assert.doesNotReject(() => store.save(ANNA, NOTE));
  await assert.doesNotReject(() => store.discard(ANNA));
  await assert.doesNotReject(() => store.discardAll());
  assert.strictEqual(await store.load(ANNA), null, 'a failed read is simply no draft');
});

test('the file name carries the scope and none of the writing', () => {
  const name = draftFileName(ANNA);
  assert.strictEqual(name, 'night-7-3.txt');
  assert.ok(!name.includes(NOTE));
  assert.ok(!/[a-z]{5,}/.test(name.replace('night', '').replace('txt', '')));
});

test('android auto-backup is disabled so unsealed drafts cannot leave the device', () => {
  const config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', 'app.json'), 'utf8'),
  );
  assert.strictEqual(
    config.expo?.android?.allowBackup,
    false,
    'app.json android.allowBackup must be false so drafts cannot enter device backup.',
  );
});

test('unsealed drafts use cache so iOS device backup cannot copy them', () => {
  const binding = fs.readFileSync(
    path.resolve(__dirname, '..', 'src', 'drafts', 'index.ts'),
    'utf8',
  );
  assert.match(binding, /new Directory\(Paths\.cache,/);
  assert.doesNotMatch(binding, /new Directory\(Paths\.document,/);
});

test('the store never writes anything to the console', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '..', 'src', 'drafts', 'store.ts'),
    'utf8',
  );
  assert.doesNotMatch(source, /console\./, 'draft text must never reach a log');
  const binding = fs.readFileSync(
    path.resolve(__dirname, '..', 'src', 'drafts', 'index.ts'),
    'utf8',
  );
  assert.doesNotMatch(binding, /console\./);
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
  console.log(`\n${passed}/${tests.length} draft recovery tests passed.`);
})();
