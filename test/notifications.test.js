'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { ensureBuilt } = require('./_precompile');

const OUT = ensureBuilt();
const SRC = path.resolve(__dirname, '..', 'src', 'notifications');
const { notificationCopyBank, selectNotificationCopy } = require(path.join(OUT, 'notifications/copy.js'));
const {
  cleanNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} = require(path.join(OUT, 'notifications/preferences.js'));

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('copy selection is stable for the same moment and seed', () => {
  assert.deepStrictEqual(
    selectNotificationCopy('night_open', 'user-1:night-4'),
    selectNotificationCopy('night_open', 'user-1:night-4'),
  );
});

test('every notification uses a safe allowlisted route and contains no private fields', () => {
  const allowed = new Set(['/', '/rooms']);
  for (const rows of Object.values(notificationCopyBank())) {
    for (const row of rows) {
      assert.ok(allowed.has(row.route));
      assert.deepStrictEqual(Object.keys(row).sort(), ['body', 'route', 'title']);
      assert.ok(row.title.length <= 40);
      assert.ok(row.body.length <= 100);
    }
  }
});

test('disabled notifications disable every category', () => {
  assert.deepStrictEqual(cleanNotificationPreferences({ enabled: false }), {
    enabled: false,
    morningReminder: false,
    eveningReminder: false,
    dailyReflection: false,
    streakReminder: false,
    silentRoomReminder: false,
  });
});

test('defaults keep morning and retired Silent Room reminders off', () => {
  assert.strictEqual(DEFAULT_NOTIFICATION_PREFERENCES.morningReminder, false);
  assert.strictEqual(DEFAULT_NOTIFICATION_PREFERENCES.silentRoomReminder, false);
});

test('native notification response APIs are never called on web', () => {
  const source = fs.readFileSync(path.join(SRC, 'NotificationRouting.tsx'), 'utf8');
  const webGuard = source.indexOf("if (Platform.OS === 'web') return;");
  const nativeCall = source.indexOf('Notifications.getLastNotificationResponseAsync()');
  assert.ok(webGuard >= 0, 'expected an explicit web guard');
  assert.ok(webGuard < nativeCall, 'web guard must run before native notification APIs');
});

(async () => {
  let passed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log('ok   -', name);
      passed += 1;
    } catch (err) {
      console.error('FAIL -', name);
      console.error('      ', err.message);
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} notification tests passed.`);
})();
