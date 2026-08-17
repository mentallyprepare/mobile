'use strict';

// The four rematch-cooldown states the safety screen renders. Each case
// asserts that the copy actually describes the state (nothing invents a
// countdown from missing data, nothing says "available" when the server
// says otherwise). Run: npm run test:rematch

const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const { describeRematchAvailability, QUIET_WINDOW_DAYS, SWITCHES_PER_CYCLE } =
  require(path.join(OUT, 'safety/rematch.js'));

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function baseStatus(overrides = {}) {
  return {
    hasPartner: true,
    partnerHasWrittenToday: false,
    nextUnsealAt: null,
    canSwitch: false,
    switchesRemaining: 2,
    status: 'active',
    daysSinceActive: 0,
    nextSwitchAvailableAt: null,
    ...overrides,
  };
}

test('no match returns the no-match kind', () => {
  assert.strictEqual(describeRematchAvailability(null).kind, 'no-match');
  assert.strictEqual(
    describeRematchAvailability(baseStatus({ hasPartner: false })).kind,
    'no-match',
  );
});

test('canSwitch true returns available with switches-remaining count', () => {
  const r = describeRematchAvailability(baseStatus({ canSwitch: true }));
  assert.strictEqual(r.kind, 'available');
  assert.match(r.long, /2 switches remaining/);
});

test('one switch remaining says "switch" not "switches"', () => {
  const r = describeRematchAvailability(
    baseStatus({ canSwitch: true, switchesRemaining: 1 }),
  );
  assert.match(r.long, /1 switch remaining/);
  assert.doesNotMatch(r.long, /switches/);
});

test('exhausted switches returns exhausted kind, not cooldown', () => {
  const r = describeRematchAvailability(baseStatus({ switchesRemaining: 0 }));
  assert.strictEqual(r.kind, 'exhausted');
  assert.match(r.long, new RegExp(`maximum ${SWITCHES_PER_CYCLE} times`));
});

test('cooldown reports exact days remaining when data is present', () => {
  // day 2 of a 5-day window → 3 days to go
  const r = describeRematchAvailability(baseStatus({ daysSinceActive: 2 }));
  assert.strictEqual(r.kind, 'cooldown');
  assert.strictEqual(r.daysRemaining, 3);
  assert.match(r.long, /Available in 3 days/);
});

test('cooldown at exactly one day remaining pluralises "day" correctly', () => {
  const r = describeRematchAvailability(baseStatus({ daysSinceActive: 4 }));
  assert.strictEqual(r.daysRemaining, 1);
  assert.match(r.long, /1 day\b/);
});

test('cooldown with unknown daysSinceActive shows generic wait copy — no NaN', () => {
  const r = describeRematchAvailability(baseStatus({ daysSinceActive: null }));
  assert.strictEqual(r.kind, 'cooldown');
  assert.strictEqual(r.daysRemaining, null);
  assert.doesNotMatch(r.long, /NaN|undefined|null/);
  assert.match(r.long, new RegExp(`${QUIET_WINDOW_DAYS} days`));
});

(async () => {
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('ok   -', name);
      passed++;
    } catch (err) {
      console.error('FAIL -', name);
      console.error('      ', err.message);
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} rematch cooldown tests passed.`);
})();
