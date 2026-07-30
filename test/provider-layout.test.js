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

console.log('ok   - every route is inside the shared data providers');
