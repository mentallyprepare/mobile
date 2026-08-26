'use strict';

// Static contract for the app's two failure surfaces: the route-level
// ErrorBoundary that expo-router invokes when a render throws, and the
// +not-found route it falls back to when nothing matches. Neither existed
// before — a crash was a white screen and a bad link was a freeze. This
// test fails if either one goes missing again.

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const rootLayout = read('app', '_layout.tsx');
const notFound = read('app', '+not-found.tsx');

// Named export, not default. Expo-router discovers the boundary by name.
assert.match(
  rootLayout,
  /export function ErrorBoundary\(/,
  'the root layout must export a named ErrorBoundary for expo-router',
);
// The signature it is called with — a mistyped prop name means the boundary
// renders but the retry button does nothing.
assert.match(
  rootLayout,
  /ErrorBoundary\(\{[^}]*retry[^}]*\}/,
  'ErrorBoundary must accept the retry prop it will be handed',
);
// A crash message that talks about the user's writing being safe is the one
// promise this screen exists to make.
assert.match(
  rootLayout,
  /Nothing you wrote has been removed/,
  'ErrorBoundary must reassure that no writing is lost',
);

assert(
  fs.existsSync(path.join(root, 'app', '+not-found.tsx')),
  'app/+not-found.tsx must exist so expo-router has a fallback route',
);
assert.match(
  notFound,
  /export default function NotFound/,
  '+not-found.tsx must default-export the fallback screen',
);
assert.match(
  notFound,
  /href="\/"/,
  'not-found needs a link home; a dead end with no exit is why this route exists',
);

console.log('ok   - ErrorBoundary and +not-found are wired');
