'use strict';

// Shared TypeScript compile for the test suite.
//
// Every *.test.js used to shell out to tsc for its own compile — twelve cold
// invocations per `npm test`, most of them building files another test also
// needed. This module collects the union of those sources, runs one tsc, and
// caches the result inside the process. Idempotent: the second call is a
// no-op even across require()s.
//
// A test asks for its dependency by relative path from `src/`, mirroring the
// on-disk layout, so a file at `src/api/client.ts` becomes
// `require(compiledPath('api/client.js'))`.

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BUILD_DIR = path.join(__dirname, '.build');

// Every source a test currently compiles. Adding a new test that needs a
// file not listed here? Add it — the cost is one entry, not another cold
// tsc spawn.
const SOURCES = [
  'api/client.ts',
  'api/keys.ts',
  'api/failures.ts',
  'api/load-state.ts',
  'api/parse.ts',
  'api/parse-me.ts',
  'api/parse-shelf.ts',
  'api/types-me.ts',
  'api/types-shelf.ts',
  'sky.ts',
  'quiz.ts',
  'fonts/gate.ts',
  'drafts/store.ts',
  'design/colors.ts',
  'design/chrome.ts',
  'notifications/copy.ts',
  'notifications/preferences.ts',
  'auth/password-reset.ts',
  'auth/sign-up.ts',
  'safety/contracts.ts',
];

let built = false;

/**
 * Cheapest possible freshness check: if every compiled output exists AND is
 * newer than the newest source, the previous compile is still valid and we
 * can skip tsc entirely. Each `npm run test:*` script spawns its own Node
 * process, so an in-memory flag alone doesn't help across scripts — the
 * disk check does.
 */
function outputsAreFresh() {
  try {
    const newestSource = SOURCES.reduce((max, rel) => {
      const mtime = fs.statSync(path.join(SRC, rel)).mtimeMs;
      return mtime > max ? mtime : max;
    }, 0);
    for (const rel of SOURCES) {
      const out = path.join(BUILD_DIR, rel.replace(/\.ts$/, '.js'));
      const stat = fs.statSync(out); // throws if missing → not fresh
      if (stat.mtimeMs < newestSource) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function ensureBuilt() {
  if (built) return BUILD_DIR;
  if (outputsAreFresh()) {
    built = true;
    return BUILD_DIR;
  }
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  // Run tsc from a cwd OUTSIDE the project. Otherwise it walks up, finds the
  // project's tsconfig.json, and errors TS5112 because files were named on
  // the command line while a tsconfig is present. Same trick the per-test
  // compiles used with os.tmpdir().
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-precompile-'));
  try {
    execFileSync(
      process.execPath,
      [
        require.resolve('typescript/bin/tsc'),
        ...SOURCES.map((rel) => path.join(SRC, rel)),
        '--outDir', BUILD_DIR,
        '--rootDir', SRC,
        '--module', 'commonjs',
        '--target', 'es2020',
        '--esModuleInterop',
        '--skipLibCheck',
      ],
      { stdio: 'pipe', cwd },
    );
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
  built = true;
  return BUILD_DIR;
}

/**
 * Path to a compiled source under the build directory. Prefer this over
 * hand-composing paths so a future move of BUILD_DIR touches one file.
 */
function compiledPath(relative) {
  return path.join(BUILD_DIR, relative);
}

if (require.main === module) {
  ensureBuilt();
  console.log('ok   - test sources compiled to', path.relative(ROOT, BUILD_DIR));
}

module.exports = { ensureBuilt, compiledPath, BUILD_DIR };
