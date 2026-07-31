'use strict';

// Tests the API client's auth behaviour with an injected fake fetch and
// in-memory storage. Run: npm run test:api
//
// The client is TypeScript, so this compiles src/api/{client,keys}.ts into a
// temp dir first. It imports no react-native, which is what makes this possible.

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-api-test-'));
const SRC = path.resolve(__dirname, '..', 'src', 'api');

// Invoke tsc through node rather than the npx shim (the .cmd shim needs a shell
// on Windows), and run it from the temp dir with absolute inputs so the project
// tsconfig.json is not picked up — naming files on the command line while a
// tsconfig is present is an error (TS5112).
execFileSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'),
   path.join(SRC, 'client.ts'), path.join(SRC, 'keys.ts'),
   '--outDir', OUT,
   '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { stdio: 'pipe', cwd: OUT }
);

const { createApiClient, NetworkError, ApiError } = require(path.join(OUT, 'client.js'));
const { ACCESS_KEY, REFRESH_KEY } = require(path.join(OUT, 'keys.js'));

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    get: async (k) => (map.has(k) ? map.get(k) : null),
    set: async (k, v) => void map.set(k, v),
    remove: async (k) => void map.delete(k),
    _map: map,
  };
}

const json = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('attaches the bearer header when a token is stored', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'tok-a' });
  const seen = [];
  const api = createApiClient({
    baseUrl: 'https://x.test/',
    storage,
    fetchImpl: async (url, init) => { seen.push({ url, init }); return json(200, { ok: true }); },
  });
  await api.request('/api/me');
  assert.strictEqual(seen[0].url, 'https://x.test/api/me', 'trailing slash normalised');
  assert.strictEqual(seen[0].init.headers.Authorization, 'Bearer tok-a');
});

test('sends no Authorization header when signed out', async () => {
  const storage = memoryStorage();
  let captured;
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (_u, init) => { captured = init; return json(200, {}); },
  });
  await api.request('/api/me');
  assert.ok(!captured.headers.Authorization);
});

test('on 401 it refreshes, stores the new pair, and retries once', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'stale', [REFRESH_KEY]: 'r1' });
  const calls = [];
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url, init) => {
      calls.push(url);
      if (url.endsWith('/api/auth/token/refresh')) {
        return json(200, { ok: true, auth: { accessToken: 'fresh', refreshToken: 'r2' } });
      }
      return init.headers.Authorization === 'Bearer fresh'
        ? json(200, { user: { id: 1 } })
        : json(401, { error: 'Not authenticated' });
    },
  });

  const out = await api.request('/api/me');
  assert.deepStrictEqual(out, { user: { id: 1 } });
  assert.deepStrictEqual(calls, [
    'https://x.test/api/me',
    'https://x.test/api/auth/token/refresh',
    'https://x.test/api/me',
  ], 'exactly one refresh and one retry');
  assert.strictEqual(await storage.get(ACCESS_KEY), 'fresh');
  assert.strictEqual(await storage.get(REFRESH_KEY), 'r2', 'rotated refresh token stored');
});

test('a rejected refresh token clears the session and surfaces 401', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'stale', [REFRESH_KEY]: 'dead' });
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url) =>
      url.endsWith('/api/auth/token/refresh')
        ? json(401, { error: 'Invalid or expired refresh token' })
        : json(401, { error: 'Not authenticated' }),
  });

  await assert.rejects(() => api.request('/api/me'), (e) => e.status === 401);
  assert.strictEqual(await storage.get(ACCESS_KEY), null, 'tokens cleared');
  assert.strictEqual(await storage.get(REFRESH_KEY), null);
});

test('it does not retry more than once', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'a', [REFRESH_KEY]: 'r' });
  let meCalls = 0;
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url) => {
      if (url.endsWith('/api/auth/token/refresh')) {
        return json(200, { ok: true, auth: { accessToken: 'a2', refreshToken: 'r2' } });
      }
      meCalls++;
      return json(401, { error: 'Not authenticated' });
    },
  });
  await assert.rejects(() => api.request('/api/me'));
  assert.strictEqual(meCalls, 2, 'original + one retry, then give up');
});

test('concurrent 401s collapse into a single refresh', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'stale', [REFRESH_KEY]: 'r1' });
  let refreshCalls = 0;
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url, init) => {
      if (url.endsWith('/api/auth/token/refresh')) {
        refreshCalls++;
        await new Promise((r) => setTimeout(r, 10));
        return json(200, { ok: true, auth: { accessToken: 'fresh', refreshToken: 'r2' } });
      }
      return init.headers.Authorization === 'Bearer fresh' ? json(200, {}) : json(401, {});
    },
  });

  await Promise.all([api.request('/api/a'), api.request('/api/b'), api.request('/api/c')]);
  assert.strictEqual(refreshCalls, 1, 'three parallel 401s -> one refresh');
});

test('a rejected refresh notifies onSessionLost exactly once', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'stale', [REFRESH_KEY]: 'dead' });
  let lostCalls = 0;
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url) =>
      url.endsWith('/api/auth/token/refresh')
        ? json(401, { error: 'Invalid or expired refresh token' })
        : json(401, { error: 'Not authenticated' }),
  });
  api.onSessionLost(() => { lostCalls++; });

  await assert.rejects(() => api.request('/api/me'));
  assert.strictEqual(lostCalls, 1, 'session-lost fires once when refresh is rejected');
});

test('a malformed refresh body also notifies onSessionLost', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'stale', [REFRESH_KEY]: 'r1' });
  let lostCalls = 0;
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url) =>
      url.endsWith('/api/auth/token/refresh')
        ? json(200, { ok: true /* no auth pair */ })
        : json(401, {}),
  });
  api.onSessionLost(() => { lostCalls++; });

  await assert.rejects(() => api.request('/api/me'));
  assert.strictEqual(lostCalls, 1);
  assert.strictEqual(await storage.get(ACCESS_KEY), null, 'tokens cleared on malformed body');
});

test('a network failure during refresh does NOT notify onSessionLost', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'a', [REFRESH_KEY]: 'r' });
  let lostCalls = 0;
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url) => {
      if (url.endsWith('/api/auth/token/refresh')) throw new Error('offline');
      return json(401, {});
    },
  });
  api.onSessionLost(() => { lostCalls++; });

  await assert.rejects(() => api.request('/api/me'));
  assert.strictEqual(lostCalls, 0, 'a dropped connection is not a sign-out');
  assert.strictEqual(await storage.get(REFRESH_KEY), 'r');
});

test('onSessionLost returns an unsubscribe function', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'stale', [REFRESH_KEY]: 'dead' });
  let lostCalls = 0;
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url) =>
      url.endsWith('/api/auth/token/refresh')
        ? json(401, {})
        : json(401, {}),
  });
  const unsubscribe = api.onSessionLost(() => { lostCalls++; });
  unsubscribe();
  await assert.rejects(() => api.request('/api/me'));
  assert.strictEqual(lostCalls, 0, 'unsubscribed handler is not called');
});

test('a network failure during refresh keeps the tokens', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'a', [REFRESH_KEY]: 'r' });
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: async (url) => {
      if (url.endsWith('/api/auth/token/refresh')) throw new Error('offline');
      return json(401, {});
    },
  });
  await assert.rejects(() => api.request('/api/me'));
  assert.strictEqual(await storage.get(REFRESH_KEY), 'r', 'offline must not sign the user out');
});

test('204 responses resolve to null instead of throwing', async () => {
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage: memoryStorage(),
    fetchImpl: async () => ({ ok: true, status: 204, json: async () => { throw new Error('no body'); } }),
  });
  assert.strictEqual(await api.request('/api/thing'), null);
});

test('a request that never answers rejects as a timeout, not a hang', async () => {
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage: memoryStorage(),
    // Never settles. Without a ceiling this is a spinner that never comes back.
    fetchImpl: () => new Promise(() => {}),
    timeoutMs: 25,
  });
  await assert.rejects(
    () => api.request('/api/me'),
    (err) => err instanceof NetworkError && err.kind === 'timeout',
  );
});

test('a timeout does not throw away the session', async () => {
  const storage = memoryStorage({ [ACCESS_KEY]: 'a', [REFRESH_KEY]: 'r' });
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage,
    fetchImpl: () => new Promise(() => {}),
    timeoutMs: 25,
  });
  await assert.rejects(() => api.request('/api/me'));
  assert.strictEqual(await storage.get(ACCESS_KEY), 'a', 'a slow network is not a sign-out');
  assert.strictEqual(await storage.get(REFRESH_KEY), 'r');
});

test('an unreachable network rejects as offline, distinguishable from a server error', async () => {
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage: memoryStorage(),
    fetchImpl: async () => { throw new TypeError('Network request failed'); },
  });
  await assert.rejects(
    () => api.request('/api/me'),
    (err) => err instanceof NetworkError && err.kind === 'offline',
  );
});

test('a server error is an ApiError, not a NetworkError', async () => {
  const api = createApiClient({
    baseUrl: 'https://x.test',
    storage: memoryStorage(),
    fetchImpl: async () => json(500, { error: 'boom' }),
  });
  await assert.rejects(
    () => api.request('/api/me'),
    (err) => err instanceof ApiError && err.status === 500,
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
  console.log(`\n${passed}/${tests.length} API client tests passed.`);
})();
