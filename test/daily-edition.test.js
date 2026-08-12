'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-daily-edition-test-'));
const source = path.resolve(__dirname, '..', 'src', 'daily-edition.ts');
execFileSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'), source, '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { stdio: 'pipe', cwd: out },
);

const { FEELINGS, reflectionFor } = require(path.join(out, 'daily-edition.js'));

assert.deepStrictEqual(FEELINGS, ['restless', 'quiet', 'hopeful', 'heavy', 'clear']);
assert.match(reflectionFor([]), /stays on this device/);
assert.match(reflectionFor(['quiet']), /Quiet counts/);
assert.match(reflectionFor(['heavy', 'hopeful']), /More than one feeling can be true/);
assert.ok(!reflectionFor(['clear']).match(/AI|diagnos|compatib/i));

fs.rmSync(out, { recursive: true, force: true });
console.log('4/4 daily edition tests passed.');
