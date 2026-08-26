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

export default function DeleteAccountScreen() {
  const router = useRouter();
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
      setError(err instanceof Error ? err.message : 'The account was not deleted.');
      setBusy(false);
    }
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

      <Text style={styles.eyebrow}>DELETE ACCOUNT</Text>
      <Text style={styles.title}>this cannot be undone.</Text>
      <Text style={styles.intro}>
        Your account, profile, writing, match history, comments, reveal choices,
        notification devices, and associated data will be permanently removed.
      </Text>

      <DaylightCard style={styles.warning} accent="rose">
        <Text style={styles.warningTitle}>export first if you need a copy.</Text>
        <Text style={styles.warningBody}>
          Return to Safety & Privacy and choose “export my data” before
          continuing. Deletion cannot be reversed by support.
        </Text>
      </DaylightCard>

      <Text style={styles.label}>PASSWORD</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoCapitalize="none"
        accessibilityLabel="Current password"
        placeholder="current password"
        placeholderTextColor={daylight.inkLow}
        style={styles.input}
      />

      <Text style={styles.label}>TYPE DELETE TO CONFIRM</Text>
      <TextInput
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="characters"
        autoCorrect={false}
        accessibilityLabel="Type DELETE to confirm"
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
            {busy ? 'deleting permanently…' : 'permanently delete account'}
          </Text>
        </Pressable>
        <DaylightButton
          label="keep my account"
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
