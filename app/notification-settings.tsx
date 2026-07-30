import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DaylightButton from '../src/components/DaylightButton';
import DaylightCard from '../src/components/DaylightCard';
import DaylightScreen from '../src/components/DaylightScreen';
import {
  getNotificationSettings,
  saveNotificationSettings,
} from '../src/api/notifications';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '../src/notifications/preferences';
import {
  enableNativeNotifications,
  disableNativeNotificationsForThisDevice,
  notificationPermissionStatus,
  type NotificationSetupFailure,
} from '../src/notifications/registration';
import { daylight, layout, radius, space, type } from '../src/design';

const SETUP_MESSAGES: Record<NotificationSetupFailure, string> = {
  not_a_device: 'Notifications can be enabled from the installed Android or iOS beta.',
  permission_denied: 'Notifications are blocked in your device settings. Mentally will stay quiet.',
  project_not_configured: 'The installed beta is not connected to its notification service yet.',
  registration_failed: 'Could not finish setting up notifications. Try again in a moment.',
};

type PreferenceKey =
  | 'morningReminder'
  | 'eveningReminder'
  | 'dailyReflection'
  | 'streakReminder';

const ROWS: { key: PreferenceKey; title: string; body: string }[] = [
  {
    key: 'dailyReflection',
    title: 'Tonight is open',
    body: 'One reminder when a nightly reflection becomes available.',
  },
  {
    key: 'eveningReminder',
    title: 'Room activity',
    body: 'A neutral cue when something real changes in your active Room.',
  },
  {
    key: 'streakReminder',
    title: 'Gentle return',
    body: 'A quiet reminder after time away. No streak-loss pressure.',
  },
  {
    key: 'morningReminder',
    title: 'Morning pause',
    body: 'An optional morning reset. Off by default.',
  },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([getNotificationSettings(), notificationPermissionStatus()])
      .then(([settings, permission]) => {
        if (!active) return;
        setPreferences(settings.preferences);
        setSubscribed(settings.subscribed && permission === 'granted');
      })
      .catch(() => {
        if (active) setMessage('Could not load notification settings.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function turnOn() {
    setBusy(true);
    setMessage(null);
    const result = await enableNativeNotifications();
    if (!result.ok) {
      setMessage(SETUP_MESSAGES[result.reason]);
      setBusy(false);
      return;
    }
    try {
      const saved = await saveNotificationSettings({ ...preferences, enabled: true });
      setPreferences(saved);
      setSubscribed(true);
      setMessage('Notifications are on. Private writing never appears in a notification.');
    } catch {
      setMessage('Notifications were allowed, but the preference could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setMessage(null);
    const next = {
      ...preferences,
      enabled: false,
      morningReminder: false,
      eveningReminder: false,
      dailyReflection: false,
      streakReminder: false,
      silentRoomReminder: false,
    };
    await Promise.allSettled([
      disableNativeNotificationsForThisDevice(),
      saveNotificationSettings(next),
    ]);
    setPreferences(next);
    setSubscribed(false);
    setBusy(false);
    setMessage('Notifications are off.');
  }

  async function toggle(key: PreferenceKey, value: boolean) {
    const previous = preferences;
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setMessage(null);
    try {
      setPreferences(await saveNotificationSettings(next));
    } catch {
      setPreferences(previous);
      setMessage('Could not save that change.');
    }
  }

  if (loading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator color={daylight.accent} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <DaylightScreen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.back}
      >
        <Text style={styles.backLabel}>← back</Text>
      </Pressable>

      <Text style={styles.eyebrow}>NOTIFICATIONS</Text>
      <Text style={styles.title}>quiet, useful, yours.</Text>
      <Text style={styles.intro}>
        Mentally only sends reviewed, neutral reminders. Journal text, prompt
        answers, and another person&apos;s identity stay off the lock screen.
      </Text>

      <DaylightCard style={styles.statusCard} accent={subscribed ? 'moss' : 'violet'}>
        <Text style={styles.statusTitle}>
          {subscribed ? 'notifications are on.' : 'notifications are off.'}
        </Text>
        <Text style={styles.statusBody}>
          {Platform.OS === 'web'
            ? 'Use the installed Android or iOS beta to receive native notifications.'
            : subscribed
              ? 'You can change each category below at any time.'
              : 'Nothing will be requested until you choose to turn them on.'}
        </Text>
        <View style={styles.statusAction}>
          <DaylightButton
            label={busy ? 'one moment…' : subscribed ? 'turn off' : 'turn on notifications'}
            onPress={subscribed ? turnOff : turnOn}
            disabled={busy || Platform.OS === 'web'}
            variant={subscribed ? 'ghost' : 'primary'}
            block
          />
        </View>
      </DaylightCard>

      <Text style={styles.section}>WHAT MAY REACH YOU</Text>
      <View style={styles.list}>
        {ROWS.map((row) => (
          <View key={row.key} style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowBody}>{row.body}</Text>
            </View>
            <Switch
              value={preferences[row.key]}
              onValueChange={(value) => void toggle(row.key, value)}
              disabled={!subscribed || busy}
              accessibilityLabel={row.title}
              trackColor={{ false: daylight.border, true: daylight.bgAlt }}
              thumbColor={preferences[row.key] ? daylight.accent : daylight.inkLow}
            />
          </View>
        ))}
      </View>

      <DaylightCard style={styles.promise}>
        <Text style={styles.promiseTitle}>the promise.</Text>
        <Text style={styles.promiseBody}>
          No private writing. No fake urgency. No “they are waiting for you.”
          No more than one routine evening reminder. Sensitive account and
          safety notices remain direct and calm.
        </Text>
      </DaylightCard>

      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </DaylightScreen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: daylight.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: { alignSelf: 'flex-start', paddingVertical: 6 },
  backLabel: { ...type.body, fontSize: 13.5, color: daylight.inkMid },
  eyebrow: {
    marginTop: space.xl,
    ...type.eyebrow,
    color: daylight.accent,
    letterSpacing: 1.5,
  },
  title: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 36,
    lineHeight: 42,
    color: daylight.ink,
  },
  intro: {
    marginTop: space.md,
    maxWidth: layout.maxWidth,
    ...type.body,
    lineHeight: 23,
    color: daylight.inkMid,
  },
  statusCard: { marginTop: space.xl },
  statusTitle: { ...type.displayItalic, fontSize: 23, color: daylight.ink },
  statusBody: { marginTop: space.sm, ...type.body, lineHeight: 22, color: daylight.inkMid },
  statusAction: { marginTop: space.lg },
  section: {
    marginTop: space.xl,
    marginBottom: space.sm,
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 1.5,
    color: daylight.inkMid,
  },
  list: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    overflow: 'hidden',
  },
  row: {
    minHeight: 82,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: daylight.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rowCopy: { flex: 1 },
  rowTitle: { ...type.body, fontSize: 15, color: daylight.ink },
  rowBody: { marginTop: 3, ...type.bodySmall, lineHeight: 18, color: daylight.inkMid },
  promise: { marginTop: space.xl },
  promiseTitle: { ...type.displayItalic, fontSize: 21, color: daylight.ink },
  promiseBody: { marginTop: space.sm, ...type.bodySmall, lineHeight: 20, color: daylight.inkMid },
  message: {
    marginTop: space.lg,
    ...type.bodySmall,
    lineHeight: 20,
    color: daylight.accentRose,
  },
});
