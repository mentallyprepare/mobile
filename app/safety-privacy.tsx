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
import { describeRematchAvailability } from '../src/safety/rematch';
import { daylight, radius, space, type } from '../src/design';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

type Confirmation = 'block' | 'rematch' | 'switch' | null;

export default function SafetyPrivacyScreen() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes
  const { data, reload } = useMeShared();
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasMatch = !!data?.match;
  const canSwitch = !!data?.partnerStatus?.canSwitch;
  const rematch = describeRematchAvailability(data?.partnerStatus);

  async function performConfirmedAction() {
    if (!confirmation) return;
    setBusy(true);
    setMessage(null);
    try {
      if (confirmation === 'block') {
        await blockCurrentPartner('Blocked from mobile safety controls');
        setMessage(t('safety_privacy.msg_blocked'));
      } else if (confirmation === 'rematch') {
        await requestRematch('Requested from mobile safety controls');
        setMessage(t('safety_privacy.msg_rematch_saved'));
      } else {
        const result = await switchPartner();
        setMessage(
          result.matched
            ? t('safety_privacy.msg_switch_matched')
            : t('safety_privacy.msg_switch_unmatched'),
        );
      }
      await reload();
      setConfirmation(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('safety_privacy.msg_action_error'));
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
          ? t('safety_privacy.msg_export_shared')
          : t('safety_privacy.msg_export_unavailable'),
      );
    } catch {
      setMessage(t('safety_privacy.msg_export_error'));
    } finally {
      setExporting(false);
    }
  }

  const confirmationCopy =
    confirmation === 'block'
      ? {
          title: t('safety_privacy.confirm_block_title'),
          body: t('safety_privacy.confirm_block_body'),
          label: t('safety_privacy.confirm_block_label'),
          destructive: true,
        }
      : confirmation === 'switch'
        ? {
            title: t('safety_privacy.confirm_switch_title'),
            body: t('safety_privacy.confirm_switch_body'),
            label: t('safety_privacy.confirm_switch_label'),
            destructive: true,
          }
        : {
            title: t('safety_privacy.confirm_rematch_title'),
            body: t('safety_privacy.confirm_rematch_body'),
            label: t('safety_privacy.confirm_rematch_label'),
            destructive: false,
          };

  return (
    <DaylightScreen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('safety_privacy.back_a11y')}
        style={styles.back}
      >
        <Text style={styles.backLabel}>{t('safety_privacy.back')}</Text>
      </Pressable>

      <Text style={styles.eyebrow}>{t('safety_privacy.eyebrow')}</Text>
      <Text style={styles.title}>{t('safety_privacy.title')}</Text>
      <Text style={styles.intro}>{t('safety_privacy.intro')}</Text>

      <View style={styles.group}>
        <ActionRow
          title={t('safety_privacy.support_title')}
          body={t('safety_privacy.support_body')}
          onPress={() => router.push('/support' as Href)}
        />
      </View>

      <Text style={styles.section}>{t('safety_privacy.section_connection')}</Text>
      <View style={styles.group}>
        <ActionRow
          title={t('safety_privacy.report_title')}
          body={t('safety_privacy.report_body')}
          onPress={() => router.push('/report' as Href)}
        />
        <ActionRow
          title={t('safety_privacy.rematch_title')}
          body={t('safety_privacy.rematch_body')}
          disabled={!hasMatch}
          onPress={() => setConfirmation('rematch')}
        />
        <ActionRow
          title={t('safety_privacy.switch_title')}
          body={rematch.long}
          disabled={!hasMatch || !canSwitch}
          onPress={() => setConfirmation('switch')}
        />
        <ActionRow
          title={t('safety_privacy.block_title')}
          body={t('safety_privacy.block_body')}
          danger
          disabled={!hasMatch}
          onPress={() => setConfirmation('block')}
        />
      </View>

      <Text style={styles.section}>{t('safety_privacy.section_data')}</Text>
      <View style={styles.group}>
        <ActionRow
          title={exporting ? t('safety_privacy.export_busy') : t('safety_privacy.export_title')}
          body={t('safety_privacy.export_body')}
          disabled={exporting}
          onPress={() => void exportData()}
        />
        <ActionRow
          title={t('safety_privacy.notif_title')}
          body={t('safety_privacy.notif_body')}
          onPress={() => router.push('/notification-settings' as Href)}
        />
        <ActionRow
          title={t('safety_privacy.delete_title')}
          body={t('safety_privacy.delete_body')}
          danger
          onPress={() => router.push('/delete-account' as Href)}
        />
      </View>

      <DaylightCard style={styles.promise}>
        <Text style={styles.promiseTitle}>{t('safety_privacy.promise_title')}</Text>
        <Text style={styles.promiseBody}>{t('safety_privacy.promise_body')}</Text>
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
