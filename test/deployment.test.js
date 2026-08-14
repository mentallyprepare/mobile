'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);
const caddyfile = fs.readFileSync(path.join(root, 'Caddyfile'), 'utf8');
const rootLayout = fs.readFileSync(path.join(root, 'app', '_layout.tsx'), 'utf8');
const updatePrompt = fs.readFileSync(
  path.join(root, 'src', 'components', 'app', 'WebUpdatePrompt.tsx'),
  'utf8',
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
assert.match(
  caddyfile,
  /header @bundles Cache-Control "public, max-age=31536000, immutable"/,
  'fingerprinted web bundles should remain safely cacheable',
);
assert.match(
  caddyfile,
  /header @documents Cache-Control "no-cache, no-store, must-revalidate"/,
  'document routes must revalidate after a deployment',
);
assert.match(
  caddyfile,
  /try_files \{path\} \/index\.html/,
  'the custom cache policy must preserve SPA route fallback',
);
assert.match(
  rootLayout,
  /<WebUpdatePrompt \/>/,
  'the root layout must render the web update prompt',
);
assert.match(
  updatePrompt,
  /cache: 'no-store'/,
  'the version check must bypass the browser cache',
);
assert.match(
  updatePrompt,
  /document\.addEventListener\('visibilitychange'/,
  'returning to the app should check for a newer release',
);
assert.match(
  updatePrompt,
  /Your saved work stays safe\./,
  'the prompt must explain that refreshing does not remove saved work',
);

console.log('ok   - deployment output, cache policy, and update prompt use one contract');
