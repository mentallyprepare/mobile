'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-daily-edition-test-'));
const source = path.resolve(__dirname, '..', 'src', 'daily-edition.ts');
const feedSource = path.resolve(__dirname, '..', 'src', 'stardust-feed.ts');
execFileSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'), source, feedSource, '--outDir', out, '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck'],
  { stdio: 'pipe', cwd: out },
);

const { FEELINGS, reflectionFor } = require(path.join(out, 'daily-edition.js'));
const { CONTENT_LIMITS, MORE_TAGS, PRIMARY_TAGS, RECOMMENDATIONS, compactCopy, phaseForNight } = require(path.join(out, 'stardust-feed.js'));

assert.deepStrictEqual(FEELINGS, ['restless', 'quiet', 'hopeful', 'heavy', 'clear']);
assert.match(reflectionFor([]), /stays on this device/);
assert.match(reflectionFor(['quiet']), /Quiet counts/);
assert.match(reflectionFor(['heavy', 'hopeful']), /More than one feeling can be true/);
assert.ok(!reflectionFor(['clear']).match(/AI|diagnos|compatib/i));
assert.strictEqual(PRIMARY_TAGS.length, 5);
assert.ok(MORE_TAGS.length >= 5);
assert.strictEqual(RECOMMENDATIONS.length, 3);
assert.strictEqual(phaseForNight(4).label, 'ARRIVAL');
assert.strictEqual(compactCopy('  a   short  line  ', 30), 'a short line');
assert.ok(compactCopy('This generated sentence is intentionally too long for the compact card.', 32).length <= 32);
assert.strictEqual(CONTENT_LIMITS.insight, 130);

const quickSheet = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'home', 'QuickActionSheet.tsx'), 'utf8');
assert.match(quickSheet, /accessibilityViewIsModal/);
assert.match(quickSheet, /reduceMotionChanged/);
assert.match(quickSheet, /Write tonight/);
assert.match(quickSheet, /View your journey/);

const completionBanner = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'home', 'CompletionBanner.tsx'), 'utf8');
assert.match(completionBanner, /accessibilityRole="alert"/);
assert.match(completionBanner, /reduceMotionChanged/);
assert.match(completionBanner, /Your words remain private/);

const previewRoute = fs.readFileSync(path.resolve(__dirname, '..', 'app', 'daily-preview.tsx'), 'utf8');
assert.match(previewRoute, /Sample state .* nothing is saved/);
assert.match(previewRoute, /No real partner, account, note, or match/);
assert.match(previewRoute, /if \(!PREVIEW_TOOLS_ENABLED\) return <Redirect/);
assert.match(previewRoute, /Seal preview/);
assert.match(previewRoute, /DateStrip/);
assert.match(previewRoute, /AddMoreSheet/);
assert.match(previewRoute, /PhaseVisualization/);

const homeRoute = fs.readFileSync(path.resolve(__dirname, '..', 'app', '(tabs)', 'index.tsx'), 'utf8');
assert.match(homeRoute, /RecommendationCard/);
assert.match(homeRoute, /SocialForecastCard/);
assert.match(homeRoute, /CosmicSection/);
assert.match(homeRoute, /EducationCard/);
assert.match(homeRoute, /PersonalMetricsCard/);
assert.match(homeRoute, /CommunityCard/);
assert.match(homeRoute, /RECOMMENDATIONS\.slice\(0, 2\)/);
assert.match(homeRoute, /selectedEntry/);
assert.ok(homeRoute.lastIndexOf('<ForecastCard') < homeRoute.lastIndexOf('<SocialForecastCard'));
assert.ok(homeRoute.lastIndexOf('<SocialForecastCard') < homeRoute.lastIndexOf('<TagGrid'));
assert.ok(homeRoute.lastIndexOf('PhaseVisualization') < homeRoute.lastIndexOf('InsightCard'));
assert.ok(homeRoute.lastIndexOf('PersonalMetricsCard') < homeRoute.lastIndexOf('CommunityCard'));

const orbitDot = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'home', 'OrbitDot.tsx'), 'utf8');
assert.match(orbitDot, /isReduceMotionEnabled/);
assert.match(orbitDot, /reduceMotionChanged/);
assert.match(orbitDot, /useNativeDriver: true/);
assert.match(orbitDot, /duration = 10000/);

const forecastCard = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'home', 'ForecastCard.tsx'), 'utf8');
assert.match(forecastCard, /<OrbitDot/);
assert.match(forecastCard, /compactCopy\(prompt, CONTENT_LIMITS\.forecastBody\)/);

const insightCard = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'home', 'InsightCard.tsx'), 'utf8');
assert.match(insightCard, /accessibilityState=\{canExpand \? \{ expanded \}/);
assert.match(insightCard, /Read more/);

const tabLayout = fs.readFileSync(path.resolve(__dirname, '..', 'app', '(tabs)', '_layout.tsx'), 'utf8');
assert.match(tabLayout, /StardustBottomNav/);
assert.match(tabLayout, /title: 'Journey'/);
assert.match(tabLayout, /title: 'Community'/);
// Note: the tab-hiding assertion for "create" was removed once the Create
// tab was surfaced as "Shelf" in the current five-tab shell. The rooms
// tab is still hidden (reached only by push from Journey / Home CTAs).
assert.match(tabLayout, /name="rooms" options=\{\{ href: null \}\}/);

const journeyRoute = fs.readFileSync(path.resolve(__dirname, '..', 'app', '(tabs)', 'journey.tsx'), 'utf8');
assert.match(journeyRoute, /DateStrip/);
assert.match(journeyRoute, /PhaseVisualization/);
assert.match(journeyRoute, /RecapCard/);

const addMore = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'home', 'AddMoreSheet.tsx'), 'utf8');
assert.match(addMore, /accessibilityViewIsModal/);
assert.match(addMore, /showAddMore=\{false\}/);

fs.rmSync(out, { recursive: true, force: true });
console.log('30/30 daily edition and feed tests passed.');
