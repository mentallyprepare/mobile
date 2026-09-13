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
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

// Localized at call time so a language switch re-resolves the copy.
function setupMessage(reason: NotificationSetupFailure): string {
  switch (reason) {
    case 'not_a_device':
      return t('notification_settings.setup_not_a_device');
    case 'permission_denied':
      return t('notification_settings.setup_permission_denied');
    case 'project_not_configured':
      return t('notification_settings.setup_project_not_configured');
    case 'registration_failed':
      return t('notification_settings.setup_registration_failed');
  }
}

type PreferenceKey =
  | 'morningReminder'
  | 'eveningReminder'
  | 'dailyReflection'
  | 'streakReminder';

// Title/body live in i18n keyed by `slug`; only the preference wiring is
// structural, so it stays a module constant.
const ROWS: { key: PreferenceKey; slug: string }[] = [
  { key: 'dailyReflection', slug: 'tonight_open' },
  { key: 'eveningReminder', slug: 'room_activity' },
  { key: 'streakReminder', slug: 'gentle_return' },
  { key: 'morningReminder', slug: 'morning_pause' },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes
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
        if (active) setMessage(t('notification_settings.error_load'));
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
      setMessage(setupMessage(result.reason));
      setBusy(false);
      return;
    }
    try {
      const saved = await saveNotificationSettings({ ...preferences, enabled: true });
      setPreferences(saved);
      setSubscribed(true);
      setMessage(t('notification_settings.flash_on'));
    } catch {
      setMessage(t('notification_settings.error_on_save_fail'));
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
    setMessage(t('notification_settings.flash_off'));
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
      setMessage(t('notification_settings.error_toggle_fail'));
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
        accessibilityLabel={t('notification_settings.back_a11y')}
        style={styles.back}
      >
        <Text style={styles.backLabel}>{t('notification_settings.back')}</Text>
      </Pressable>

      <Text style={styles.eyebrow}>{t('notification_settings.eyebrow')}</Text>
      <Text style={styles.title}>{t('notification_settings.title')}</Text>
      <Text style={styles.intro}>{t('notification_settings.intro')}</Text>

      <DaylightCard style={styles.statusCard} accent={subscribed ? 'moss' : 'violet'}>
        <Text style={styles.statusTitle}>
          {subscribed
            ? t('notification_settings.status_on')
            : t('notification_settings.status_off')}
        </Text>
        <Text style={styles.statusBody}>
          {Platform.OS === 'web'
            ? t('notification_settings.status_body_web')
            : subscribed
              ? t('notification_settings.status_body_on')
              : t('notification_settings.status_body_off')}
        </Text>
        <View style={styles.statusAction}>
          <DaylightButton
            label={
              busy
                ? t('notification_settings.busy')
                : subscribed
                  ? t('notification_settings.turn_off')
                  : t('notification_settings.turn_on')
            }
            onPress={subscribed ? turnOff : turnOn}
            disabled={busy || Platform.OS === 'web'}
            variant={subscribed ? 'ghost' : 'primary'}
            block
          />
        </View>
      </DaylightCard>

      <Text style={styles.section}>{t('notification_settings.section')}</Text>
      <View style={styles.list}>
        {ROWS.map((row) => {
          const rowTitle = t(`notification_settings.${row.slug}_title`);
          return (
            <View key={row.key} style={styles.row}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{rowTitle}</Text>
                <Text style={styles.rowBody}>
                  {t(`notification_settings.${row.slug}_body`)}
                </Text>
              </View>
              <Switch
                value={preferences[row.key]}
                onValueChange={(value) => void toggle(row.key, value)}
                disabled={!subscribed || busy}
                accessibilityLabel={rowTitle}
                trackColor={{ false: daylight.inkLow, true: daylight.accentMoss }}
                thumbColor={preferences[row.key] ? daylight.ink : daylight.bg}
              />
            </View>
          );
        })}
      </View>

      <DaylightCard style={styles.promise}>
        <Text style={styles.promiseTitle}>{t('notification_settings.promise_title')}</Text>
        <Text style={styles.promiseBody}>{t('notification_settings.promise_body')}</Text>
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
