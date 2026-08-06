'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);

assert.strictEqual(
  packageJson.scripts.build,
  'npm run build:web',
  'the platform default build must use the reviewed web export',
);
assert.match(
  packageJson.scripts['build:web'],
  /expo export --platform web --output-dir dist$/,
  'the web build must write the dist directory copied by the deployment image',
);

console.log('ok   - deployment build and output directory use one contract');
