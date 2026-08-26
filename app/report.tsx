import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import DaylightButton from '../src/components/DaylightButton';
import DaylightCard from '../src/components/DaylightCard';
import DaylightScreen from '../src/components/DaylightScreen';
import { submitReport } from '../src/api/safety';
import {
  canSubmitReport,
  REPORT_CATEGORIES,
  type ReportCategory,
} from '../src/safety/contracts';
import { daylight, radius, space, type } from '../src/design';

export default function ReportScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const canSubmit = canSubmitReport(category, reason) && !busy;

  async function submit() {
    if (!category || !canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await submitReport({ category, reason: reason.trim() });
      setSent(true);
    } catch {
      setError('The report could not be sent. Your draft remains on this screen.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <DaylightScreen>
        <Text style={styles.eyebrow}>REPORT RECEIVED</Text>
        <Text style={styles.title}>thank you for telling us.</Text>
        <Text style={styles.intro}>
          The other person is not notified. You can still block or close the
          connection from Safety & Privacy.
        </Text>
        <DaylightCard style={styles.info}>
          <Text style={styles.infoTitle}>what happens next.</Text>
          <Text style={styles.infoBody}>
            The report is saved for review. Mentally is not an emergency
            service and this screen does not promise an immediate response.
          </Text>
        </DaylightCard>
        <View style={styles.actions}>
          <DaylightButton
            label="back to safety controls"
            onPress={() => router.replace('/safety-privacy' as Href)}
            block
          />
          <DaylightButton
            label="find support"
            variant="ghost"
            onPress={() => router.push('/support' as Href)}
            block
          />
        </View>
      </DaylightScreen>
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

      <Text style={styles.eyebrow}>PRIVATE REPORT</Text>
      <Text style={styles.title}>tell us what happened.</Text>
      <Text style={styles.intro}>
        The other person is not told that you reported them. Share only what
        the safety team needs to understand the problem.
      </Text>

      <Pressable
        onPress={() => router.push('/support' as Href)}
        accessibilityRole="link"
        accessibilityLabel="Find crisis support"
        accessibilityHint="Helplines by region — this screen is not an emergency service"
        hitSlop={12}
        style={({ pressed }) => [styles.urgentLink, pressed && styles.pressed]}
      >
        <Text style={styles.urgentLabel}>
          if you need urgent help, find a crisis helpline →
        </Text>
      </Pressable>

      <Text style={styles.section}>WHAT BEST FITS?</Text>
      <View style={styles.categories}>
        {REPORT_CATEGORIES.map((item) => {
          const selected = category === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => setCategory(item.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.category,
                selected && styles.categorySelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.radio, selected && styles.radioSelected]} />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>WHAT SHOULD THE TEAM KNOW?</Text>
      <TextInput
        value={reason}
        onChangeText={(value) => setReason(value.slice(0, 500))}
        multiline
        textAlignVertical="top"
        placeholder="Describe what happened and when."
        placeholderTextColor={daylight.inkLow}
        accessibilityLabel="Report details"
        style={styles.input}
      />
      <Text style={styles.counter}>{reason.length}/500</Text>

      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <DaylightButton
          label={busy ? 'sending privately…' : 'send report'}
          onPress={() => void submit()}
          disabled={!canSubmit}
          block
        />
        {busy ? <ActivityIndicator color={daylight.accent} /> : null}
      </View>
    </DaylightScreen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', paddingVertical: 6 },
  backLabel: { ...type.body, fontSize: 13.5, color: daylight.inkMid },
  eyebrow: { marginTop: space.xl, ...type.eyebrow, letterSpacing: 1.5, color: daylight.accent },
  title: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 36,
    lineHeight: 42,
    color: daylight.ink,
  },
  intro: { marginTop: space.md, ...type.body, lineHeight: 23, color: daylight.inkMid },
  urgentLink: { marginTop: space.md, minHeight: 44, justifyContent: 'center' },
  urgentLabel: {
    ...type.bodySmall,
    color: daylight.accent,
    textDecorationLine: 'underline',
  },
  section: {
    marginTop: space.xl,
    marginBottom: space.sm,
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 1.5,
    color: daylight.inkMid,
  },
  categories: { gap: space.sm },
  category: {
    minHeight: 54,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  categorySelected: { borderColor: daylight.accent, backgroundColor: daylight.bgAlt },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: daylight.inkLow,
  },
  radioSelected: { borderWidth: 5, borderColor: daylight.accent },
  categoryLabel: { ...type.body, color: daylight.ink, flex: 1 },
  input: {
    minHeight: 150,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    ...type.body,
    lineHeight: 22,
    color: daylight.ink,
  },
  counter: { marginTop: space.xs, alignSelf: 'flex-end', ...type.bodySmall, color: daylight.inkLow },
  actions: { marginTop: space.xl, gap: space.md },
  error: { marginTop: space.md, ...type.bodySmall, color: daylight.accentRose },
  info: { marginTop: space.xl },
  infoTitle: { ...type.displayItalic, fontSize: 22, color: daylight.ink },
  infoBody: { marginTop: space.sm, ...type.body, lineHeight: 22, color: daylight.inkMid },
  pressed: { opacity: 0.82 },
});
