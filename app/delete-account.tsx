import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import DaylightButton from '../src/components/DaylightButton';
import DaylightCard from '../src/components/DaylightCard';
import DaylightScreen from '../src/components/DaylightScreen';
import { deleteMyAccount } from '../src/api/safety';
import { canConfirmAccountDeletion } from '../src/safety/contracts';
import { useSession } from '../src/session';
import { daylight, radius, space, type } from '../src/design';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

export default function DeleteAccountScreen() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes
  const { signOut } = useSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = canConfirmAccountDeletion(password, confirmation) && !busy;

  async function removeAccount() {
    if (!canDelete) return;
    setBusy(true);
    setError(null);
    try {
      await deleteMyAccount(password);
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('delete_account.error_failed'));
      setBusy(false);
    }
  }

  return (
    <DaylightScreen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('delete_account.back_a11y')}
        style={styles.back}
      >
        <Text style={styles.backLabel}>{t('delete_account.back')}</Text>
      </Pressable>

      <Text style={styles.eyebrow}>{t('delete_account.eyebrow')}</Text>
      <Text style={styles.title}>{t('delete_account.title')}</Text>
      <Text style={styles.intro}>{t('delete_account.intro')}</Text>

      <DaylightCard style={styles.warning} accent="rose">
        <Text style={styles.warningTitle}>{t('delete_account.warning_title')}</Text>
        <Text style={styles.warningBody}>{t('delete_account.warning_body')}</Text>
      </DaylightCard>

      <Text style={styles.label}>{t('delete_account.password_label')}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoCapitalize="none"
        accessibilityLabel={t('delete_account.password_a11y')}
        placeholder={t('delete_account.password_placeholder')}
        placeholderTextColor={daylight.inkLow}
        style={styles.input}
      />

      <Text style={styles.label}>{t('delete_account.confirm_label')}</Text>
      <TextInput
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="characters"
        autoCorrect={false}
        accessibilityLabel={t('delete_account.confirm_a11y')}
        placeholder="DELETE"
        placeholderTextColor={daylight.inkLow}
        style={styles.input}
      />

      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => void removeAccount()}
          disabled={!canDelete}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canDelete }}
          style={({ pressed }) => [
            styles.deleteButton,
            !canDelete && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.deleteLabel}>
            {busy ? t('delete_account.deleting') : t('delete_account.delete')}
          </Text>
        </Pressable>
        <DaylightButton
          label={t('delete_account.keep')}
          variant="ghost"
          onPress={() => router.back()}
          disabled={busy}
          block
        />
      </View>
    </DaylightScreen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 6 },
  backLabel: { ...type.body, fontSize: 13.5, color: daylight.inkMid },
  eyebrow: { marginTop: space.xl, ...type.eyebrow, letterSpacing: 1.5, color: daylight.danger },
  title: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 36,
    lineHeight: 42,
    color: daylight.ink,
  },
  intro: { marginTop: space.md, ...type.body, lineHeight: 23, color: daylight.inkMid },
  warning: { marginTop: space.xl },
  warningTitle: { ...type.displayItalic, fontSize: 21, color: daylight.ink },
  warningBody: { marginTop: space.sm, ...type.bodySmall, lineHeight: 20, color: daylight.inkMid },
  label: {
    marginTop: space.xl,
    marginBottom: space.sm,
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 1.4,
    color: daylight.inkMid,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    ...type.body,
    color: daylight.ink,
  },
  error: { marginTop: space.md, ...type.bodySmall, color: daylight.danger },
  actions: { marginTop: space.xl, gap: space.md },
  deleteButton: {
    minHeight: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: daylight.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: { ...type.bodyStrong, fontSize: 15, color: daylight.bg },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.82 },
});
