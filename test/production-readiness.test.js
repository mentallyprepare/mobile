'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const colors = read('src', 'design', 'colors.ts');
const rootLayout = read('app', '_layout.tsx');
const shelfCover = read('src', 'components', 'shelf', 'ShelfCover.tsx');
const notificationSettings = read('app', 'notification-settings.tsx');
const home = read('app', '(tabs)', 'index.tsx');
const safety = read('app', 'safety-privacy.tsx');
const deletion = read('app', 'delete-account.tsx');
const confirmSheet = read('src', 'components', 'ConfirmActionSheet.tsx');
const packageJson = JSON.parse(read('package.json'));

function token(name) {
  const match = colors.match(new RegExp(`\\b${name}: '([^']+)'`));
  assert(match, `expected ${name} to be an explicit color token`);
  return match[1];
}

function parseColor(value) {
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    return {
      rgb: [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16)),
      alpha: 1,
    };
  }

  const rgba = value.match(
    /^rgba\((\d+),(\d+),(\d+),([0-9.]+)\)$/,
  );
  assert(rgba, `unsupported color in contrast contract: ${value}`);
  return {
    rgb: rgba.slice(1, 4).map(Number),
    alpha: Number(rgba[4]),
  };
}

function composite(foreground, background) {
  const front = parseColor(foreground);
  const back = parseColor(background);
  assert.strictEqual(back.alpha, 1, 'contrast ground must be opaque');
  return front.rgb.map((channel, index) =>
    Math.round(channel * front.alpha + back.rgb[index] * (1 - front.alpha)),
  );
}

function channelLuminance(channel) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb) {
  return (
    0.2126 * channelLuminance(rgb[0]) +
    0.7152 * channelLuminance(rgb[1]) +
    0.0722 * channelLuminance(rgb[2])
  );
}

function contrast(foreground, background) {
  const foregroundLuminance = luminance(composite(foreground, background));
  const backgroundLuminance = luminance(parseColor(background).rgb);
  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);
  return (light + 0.05) / (dark + 0.05);
}

for (const ground of [token('void'), token('card')]) {
  assert(
    contrast(token('inkLow'), ground) >= 4.5,
    `inkLow must meet WCAG AA text contrast on ${ground}`,
  );
  assert(
    contrast(token('inkFaint'), ground) >= 3,
    `inkFaint must meet non-text UI contrast on ${ground}`,
  );
  assert(
    contrast(token('danger'), ground) >= 4.5,
    `danger must meet WCAG AA text contrast on ${ground}`,
  );
}

assert.match(
  rootLayout,
  /const \[fontsLoaded, fontError\] = useFonts/,
  'font loading must retain the failure state',
);
// The gate now takes three signals — success, failure, and a timeout — so a
// request that never answers cannot hold the splash forever. The assertion
// checks the wiring, not the exact expression, so a future refactor of the
// helper does not break the contract.
assert.match(
  rootLayout,
  /fontGate\(\{[\s\S]*?loaded:[\s\S]*?error:[\s\S]*?timedOut:[\s\S]*?\}\)/,
  'the font gate must consider load, error, and timeout',
);
assert.match(
  rootLayout,
  /const fontsReady = gate\.ready/,
  'the render gate must derive from the fontGate result',
);
assert.match(
  rootLayout,
  /preventAutoHideAsync\(\)\.catch/,
  'splash setup rejection must be handled',
);
assert.match(
  rootLayout,
  /hideAsync\(\)\.catch/,
  'splash hide rejection must be handled',
);
assert.match(
  rootLayout,
  /if \(!fontsReady\) return null/,
  'the root must wait only while fonts are unresolved',
);

assert.match(
  shelfCover,
  /topline:[\s\S]*?backgroundColor: 'rgba\(8,5,15,0\.78\)'/,
  'shelf cover metadata needs a stable dark scrim',
);
assert.match(
  shelfCover,
  /copy:[\s\S]*?backgroundColor: 'rgba\(8,5,15,0\.82\)'/,
  'shelf cover titles need a stable dark scrim',
);
assert.match(
  notificationSettings,
  /trackColor=\{\{ false: daylight\.inkLow, true: daylight\.accentMoss \}\}/,
  'notification switch tracks need visible off and on colors',
);
assert.match(
  home,
  /shelfTileText: \{ color: brand\.void \}/,
  'purple shelf tiles need dark text that meets contrast',
);

for (const source of [safety, deletion, confirmSheet]) {
  assert.doesNotMatch(
    source,
    /#A1445A/,
    'the low-contrast legacy danger color must not remain',
  );
}

assert.match(
  packageJson.scripts.test,
  /test:profile/,
  'the Inner Universe regression check must remain in the aggregate suite',
);
assert.match(
  packageJson.scripts.test,
  /test:readiness/,
  'the production-readiness contract must run in the aggregate suite',
);

console.log('ok   - font fallback and contrast contracts are production-safe');
