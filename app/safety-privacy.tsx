import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import ConfirmActionSheet from '../src/components/ConfirmActionSheet';
import DaylightCard from '../src/components/DaylightCard';
import DaylightScreen from '../src/components/DaylightScreen';
import {
  blockCurrentPartner,
  requestRematch,
  switchPartner,
} from '../src/api/safety';
import { useMeShared } from '../src/api/me-provider';
import { prepareAndShareDataExport } from '../src/privacy/export';
import { daylight, radius, space, type } from '../src/design';

type Confirmation = 'block' | 'rematch' | 'switch' | null;

export default function SafetyPrivacyScreen() {
  const router = useRouter();
  const { data, reload } = useMeShared();
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasMatch = !!data?.match;
  const canSwitch = !!data?.partnerStatus?.canSwitch;

  async function performConfirmedAction() {
    if (!confirmation) return;
    setBusy(true);
    setMessage(null);
    try {
      if (confirmation === 'block') {
        await blockCurrentPartner('Blocked from mobile safety controls');
        setMessage('The connection is closed and this person is blocked.');
      } else if (confirmation === 'rematch') {
        await requestRematch('Requested from mobile safety controls');
        setMessage('Your request was saved for review.');
      } else {
        const result = await switchPartner();
        setMessage(
          result.matched
            ? 'A new connection is ready.'
            : 'The old connection is closed. Matching is continuing quietly.',
        );
      }
      await reload();
      setConfirmation(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That action could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  async function exportData() {
    setExporting(true);
    setMessage(null);
    try {
      const result = await prepareAndShareDataExport();
      setMessage(
        result === 'shared'
          ? 'Your export is ready in the device share sheet.'
          : 'File sharing is not available on this device.',
      );
    } catch {
      setMessage('Your data could not be prepared. Nothing was changed.');
    } finally {
      setExporting(false);
    }
  }

  const confirmationCopy =
    confirmation === 'block'
      ? {
          title: 'block this person?',
          body:
            'This immediately closes the connection and blocks future contact. The current server also removes the shared match history, including writing attached to it, for both people. Use this when distance is the safer choice.',
          label: 'block and close',
          destructive: true,
        }
      : confirmation === 'switch'
        ? {
            title: 'find someone new?',
            body:
              'This closes the current connection and removes its attached exchange. The other person is not told why. Matching may take time, and you can keep writing privately while it continues.',
            label: 'close and continue',
            destructive: true,
          }
        : {
            title: 'request a new match?',
            body:
              'This sends a private request for review. It does not notify the other person or close the connection immediately.',
            label: 'send request',
            destructive: false,
          };

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

      <Text style={styles.eyebrow}>SAFETY & PRIVACY</Text>
      <Text style={styles.title}>control stays with you.</Text>
      <Text style={styles.intro}>
        Reporting is private. Blocking is immediate. You never have to remain
        in a connection to protect a streak or another person&apos;s feelings.
      </Text>

      <Text style={styles.section}>CONNECTION</Text>
      <View style={styles.group}>
        <ActionRow
          title="report something"
          body="Tell the safety team what happened. The other person is not notified."
          onPress={() => router.push('/report' as Href)}
        />
        <ActionRow
          title="request a new match"
          body="Ask for a private review without confronting the other person."
          disabled={!hasMatch}
          onPress={() => setConfirmation('rematch')}
        />
        <ActionRow
          title="find someone new"
          body={
            canSwitch
              ? 'Available because this connection has been inactive.'
              : 'Available after the current connection has been inactive long enough.'
          }
          disabled={!hasMatch || !canSwitch}
          onPress={() => setConfirmation('switch')}
        />
        <ActionRow
          title="block and close"
          body="Immediately stop this connection and future contact."
          danger
          disabled={!hasMatch}
          onPress={() => setConfirmation('block')}
        />
      </View>

      <Text style={styles.section}>YOUR DATA</Text>
      <View style={styles.group}>
        <ActionRow
          title={exporting ? 'preparing your export…' : 'export my data'}
          body="Save a JSON copy of the personal data connected to your account."
          disabled={exporting}
          onPress={() => void exportData()}
        />
        <ActionRow
          title="notification privacy"
          body="Choose what may appear on your lock screen."
          onPress={() => router.push('/notification-settings' as Href)}
        />
        <ActionRow
          title="delete my account"
          body="Permanently delete your account and associated data."
          danger
          onPress={() => router.push('/delete-account' as Href)}
        />
      </View>

      <DaylightCard style={styles.promise}>
        <Text style={styles.promiseTitle}>what stays private.</Text>
        <Text style={styles.promiseBody}>
          Reports are not shared with the other person. Your export stays on
          your device until you choose where to save or share it.
        </Text>
      </DaylightCard>

      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {message}
        </Text>
      ) : null}

      {busy ? <ActivityIndicator color={daylight.accent} style={styles.spinner} /> : null}

      <ConfirmActionSheet
        visible={confirmation !== null}
        title={confirmationCopy.title}
        body={confirmationCopy.body}
        confirmLabel={confirmationCopy.label}
        destructive={confirmationCopy.destructive}
        busy={busy}
        onConfirm={() => void performConfirmedAction()}
        onCancel={() => setConfirmation(null)}
      />
    </DaylightScreen>
  );
}

function ActionRow({
  title,
  body,
  onPress,
  disabled = false,
  danger = false,
}: {
  title: string;
  body: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
      accessibilityHint={body}
      style={({ pressed }) => [
        styles.row,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, danger && styles.danger]}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
      <Text style={[styles.arrow, danger && styles.danger]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 6 },
  backLabel: { ...type.body, fontSize: 13.5, color: daylight.inkMid },
  eyebrow: {
    marginTop: space.xl,
    ...type.eyebrow,
    letterSpacing: 1.5,
    color: daylight.accent,
  },
  title: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 36,
    lineHeight: 42,
    color: daylight.ink,
  },
  intro: { marginTop: space.md, ...type.body, lineHeight: 23, color: daylight.inkMid },
  section: {
    marginTop: space.xl,
    marginBottom: space.sm,
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 1.5,
    color: daylight.inkMid,
  },
  group: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    overflow: 'hidden',
  },
  row: {
    minHeight: 76,
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
  arrow: { ...type.body, fontSize: 24, color: daylight.inkLow },
  danger: { color: daylight.danger },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.82 },
  promise: { marginTop: space.xl },
  promiseTitle: { ...type.displayItalic, fontSize: 21, color: daylight.ink },
  promiseBody: { marginTop: space.sm, ...type.bodySmall, lineHeight: 20, color: daylight.inkMid },
  message: { marginTop: space.lg, ...type.bodySmall, lineHeight: 20, color: daylight.accentRose },
  spinner: { marginTop: space.md },
});
