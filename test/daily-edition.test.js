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

const quickSheet = fs.readFileSync(
  path.resolve(__dirname, '..', 'src', 'components', 'home', 'QuickActionSheet.tsx'),
  'utf8',
);
assert.match(quickSheet, /accessibilityViewIsModal/);
assert.match(quickSheet, /reduceMotionChanged/);
assert.match(quickSheet, /Write tonight/);
assert.match(quickSheet, /View your journey/);

const completionBanner = fs.readFileSync(
  path.resolve(__dirname, '..', 'src', 'components', 'home', 'CompletionBanner.tsx'),
  'utf8',
);
assert.match(completionBanner, /accessibilityRole="alert"/);
assert.match(completionBanner, /reduceMotionChanged/);
assert.match(completionBanner, /Your words remain private/);

fs.rmSync(out, { recursive: true, force: true });
console.log('11/11 daily edition tests passed.');
