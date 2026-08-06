'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootLayout = fs.readFileSync(
  path.resolve(__dirname, '..', 'app', '_layout.tsx'),
  'utf8',
);
const tabsLayout = fs.readFileSync(
  path.resolve(__dirname, '..', 'app', '(tabs)', '_layout.tsx'),
  'utf8',
);
const meProvider = fs.readFileSync(
  path.resolve(__dirname, '..', 'src', 'api', 'me-provider.tsx'),
  'utf8',
);
const shelfProvider = fs.readFileSync(
  path.resolve(__dirname, '..', 'src', 'api', 'shelf-provider.tsx'),
  'utf8',
);

assert.match(
  rootLayout,
  /<SessionProvider>\s*<MeProvider>\s*<ShelfProvider>[\s\S]*?<RootNavigator \/>/,
  'root routes must share session, me, and shelf providers',
);
assert.doesNotMatch(
  tabsLayout,
  /<MeProvider>|<ShelfProvider>/,
  'tab layout must not create duplicate data providers',
);
for (const [name, source] of [
  ['me', meProvider],
  ['shelf', shelfProvider],
]) {
  assert.match(source, /requestGenerationRef\.current \+= 1/);
  assert.match(source, /generation !== requestGenerationRef\.current/);
  assert.match(source, /signedInRef\.current !== true/);
  console.log(`ok   - ${name} provider rejects stale private data after session changes`);
}

console.log('ok   - every route is inside the shared data providers');
