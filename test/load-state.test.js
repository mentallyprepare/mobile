'use strict';

// The rule this file exists to protect: a failed request is never rendered as
// an empty first-run state. Compiles the pure modules the screens depend on
// and asserts the decision directly. Run: npm run test:load-state

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-load-state-test-'));
const SRC = path.resolve(__dirname, '..', 'src', 'api');

execFileSync(
  process.execPath,
  [
    require.resolve('typescript/bin/tsc'),
    path.join(SRC, 'load-state.ts'),
    path.join(SRC, 'failures.ts'),
    path.join(SRC, 'client.ts'),
    path.join(SRC, 'keys.ts'),
    '--outDir', OUT,
    '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck',
  ],
  { stdio: 'pipe', cwd: OUT },
);

const { describeLoad, canRenderContent } = require(path.join(OUT, 'load-state.js'));
const {
  classifyFailure,
  failureHeadline,
  failureDetail,
  staleNotice,
} = require(path.join(OUT, 'failures.js'));
const { ApiError, NetworkError } = require(path.join(OUT, 'client.js'));

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

const FAIL = new NetworkError('offline', 'nope');

test('a first load with nothing yet is a placeholder, not a failure', () => {
  assert.strictEqual(
    describeLoad({ loading: true, error: null, hasLoaded: false }),
    'first-load',
  );
});

test('a failure before anything ever loaded is a failure, never an empty state', () => {
  const view = describeLoad({ loading: false, error: FAIL, hasLoaded: false });
  assert.strictEqual(view, 'failed');
  assert.strictEqual(
    canRenderContent(view),
    false,
    'a screen must not draw its empty first-run content on a failed request',
  );
});

test('a genuinely empty successful response still renders content', () => {
  const view = describeLoad({ loading: false, error: null, hasLoaded: true });
  assert.strictEqual(view, 'ready');
  assert.strictEqual(canRenderContent(view), true);
});

test('a failed refresh keeps showing what already loaded', () => {
  const view = describeLoad({ loading: false, error: FAIL, hasLoaded: true });
  assert.strictEqual(view, 'stale');
  assert.strictEqual(
    canRenderContent(view),
    true,
    'previously loaded data must remain visible after a refresh failure',
  );
});

test('a refresh in flight over existing data is not a placeholder', () => {
  assert.strictEqual(
    describeLoad({ loading: true, error: null, hasLoaded: true }),
    'ready',
    'a background refresh must not blank the screen',
  );
});

test('failures are classified into what a screen actually needs to say', () => {
  assert.strictEqual(classifyFailure(new NetworkError('timeout', 'x')), 'timeout');
  assert.strictEqual(classifyFailure(new NetworkError('offline', 'x')), 'offline');
  assert.strictEqual(classifyFailure(new ApiError(401, 'x', null)), 'auth');
  assert.strictEqual(classifyFailure(new ApiError(403, 'x', null)), 'auth');
  assert.strictEqual(classifyFailure(new ApiError(500, 'x', null)), 'server');
  assert.strictEqual(classifyFailure(new ApiError(422, 'x', null)), 'request');
  assert.strictEqual(classifyFailure(new Error('who knows')), 'unknown');
});

test('no failure message ever claims the user lost anything', () => {
  const errors = [
    new NetworkError('timeout', 'x'),
    new NetworkError('offline', 'x'),
    new ApiError(401, 'x', null),
    new ApiError(500, 'x', null),
    new ApiError(422, 'x', null),
    new Error('unknown'),
  ];
  const forbidden = /\b(lost|deleted|gone|erased|wiped|removed your)\b/i;
  for (const err of errors) {
    for (const line of [failureHeadline(err), failureDetail(err), staleNotice(err)]) {
      assert.ok(line.length > 0, 'every failure has copy');
      assert.ok(
        !forbidden.test(line),
        `failure copy must not imply data loss: "${line}"`,
      );
    }
  }
});

test('every failure kind reassures that nothing was removed', () => {
  const reassuring = /not been removed|last saved version/i;
  for (const err of [
    new NetworkError('timeout', 'x'),
    new NetworkError('offline', 'x'),
    new ApiError(500, 'x', null),
    new Error('unknown'),
  ]) {
    assert.ok(
      reassuring.test(failureDetail(err)) || reassuring.test(staleNotice(err)),
      'the user is told their information is intact',
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
  console.log(`\n${passed}/${tests.length} load-state tests passed.`);
})();
