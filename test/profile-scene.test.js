'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scene = fs.readFileSync(
  path.join(root, 'src', 'components', 'profile', 'InnerUniverseScene.tsx'),
  'utf8',
);
const profile = fs.readFileSync(
  path.join(root, 'app', '(tabs)', 'you.tsx'),
  'utf8',
);

assert.match(
  scene,
  /starPositions\(entries,\s*userId/,
  'sealed-night stars must be driven by the real deterministic sky data',
);
assert.match(
  scene,
  /SHELF_KINDS\.map/,
  'the identity orbit must use the five real shelf slots',
);
assert.match(
  profile,
  /entries=\{entries\}[\s\S]*filledKinds=\{filledKinds\}[\s\S]*currentNight=/,
  'Profile must pass real account state into the scene',
);
assert.doesNotMatch(
  `${scene}\n${profile}`,
  /\b(tarot|zodiac|horoscope|star sign|compatibility percentage)\b/i,
  'the profile must not import astrology, tarot, or compatibility claims',
);
assert.match(
  profile,
  /Safety & privacy[\s\S]*Notification rhythm[\s\S]*Sign out/,
  'account control actions must remain present after the visual rewrite',
);

console.log('ok   - Inner Universe uses real identity data and preserves account controls');
