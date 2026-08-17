import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, type Href } from 'expo-router';
import { useMeShared } from '../src/api/me-provider';
import {
  isWaitingPiiRejection,
  saveWaitingEntry,
  WAITING_MAX_CHARS,
} from '../src/api/waiting';
import { ApiError } from '../src/api';
import { brand, radius, space, type } from '../src/design';

const MOODS = ['🌓', '🌘', '🌑', '🌒', '🌕', '☁️', '⚡'] as const;

/**
 * Waiting entry — the Day-1 draft. Different from Tonight's Question, which
 * is a community prompt shared with other waiting users; this one is your
 * private Day 1. Whatever you save here becomes your first entry the moment
 * you are matched.
 *
 * The screen auto-fills from the server-side saved draft on load (nothing
 * is lost if you close and come back). Save is upsert on the server, so
 * repeated saves overwrite cleanly.
 */
export default function WaitingEntryScreen() {
  const router = useRouter();
  const { data, reload } = useMeShared();

  const waiting = data?.waitingInfo ?? null;
  const [text, setText] = useState('');
  const [mood, setMood] = useState<string>('🌓');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [piiPrompt, setPiiPrompt] = useState<string[] | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    if (waiting) {
      setText(waiting.savedEntry);
      setHydrated(true);
    }
  }, [waiting, hydrated]);

  async function save(piiConfirmed: boolean) {
    const content = text.trim();
    if (!content || saving) return;
    setSaving(true);
    setSaveError(null);
    setPiiPrompt(null);
    try {
      const prompt = waiting?.day1Prompt ?? '';
      const result = await saveWaitingEntry(content, mood, prompt, piiConfirmed);
      setFlash('saved. this is your Day 1 when you match.');
      if (result.safety.crisis) {
        router.push('/support' as Href);
      }
      await reload();
    } catch (err) {
      if (isWaitingPiiRejection(err)) {
        setPiiPrompt(err.body.safety.piiFlags);
      } else {
        setSaveError(messageFor(err));
      }
    } finally {
      setSaving(false);
    }
  }

  // Guard: if the user got matched between opening this screen and now,
  // send them to the room instead of letting them save into a closed slot.
  useEffect(() => {
    if (data?.match) router.replace('/rooms' as Href);
  }, [data?.match, router]);

  const remaining = WAITING_MAX_CHARS - text.length;
  const canSave = text.trim().length > 0 && !saving && remaining >= 0;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Your Day 1' }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Text style={styles.backLabel}>← back</Text>
            </Pressable>
            <Text style={styles.title} accessibilityRole="header">
              Your Day 1
            </Text>
            <Text style={styles.subtitle}>
              Write it now. When you match, this becomes the first thing they read.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {waiting ? (
              <>
                <View style={styles.promptCard}>
                  <Text style={styles.kicker}>NIGHT 1 PROMPT</Text>
                  <Text style={styles.prompt}>{waiting.day1Prompt}</Text>
                </View>

                <View style={styles.compose}>
                  <View style={styles.moodRow}>
                    <Text style={styles.moodLabel}>mood</Text>
                    <View style={styles.moodOptions}>
                      {MOODS.map((m) => {
                        const active = mood === m;
                        return (
                          <Pressable
                            key={m}
                            onPress={() => setMood(m)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={`Mood ${m}`}
                            hitSlop={6}
                            style={({ pressed }) => [
                              styles.moodChip,
                              active && styles.moodChipOn,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.moodEmoji}>{m}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <TextInput
                    value={text}
                    onChangeText={(v) => {
                      setText(v.slice(0, WAITING_MAX_CHARS));
                      if (saveError) setSaveError(null);
                      if (piiPrompt) setPiiPrompt(null);
                    }}
                    multiline
                    placeholder="what is true tonight?"
                    placeholderTextColor={brand.inkFaint}
                    accessibilityLabel="Your Day 1 draft"
                    textAlignVertical="top"
                    style={styles.input}
                  />
                  <View style={styles.composeMeta}>
                    <Text
                      style={[
                        styles.counter,
                        remaining < 200 && styles.counterLow,
                        remaining < 0 && styles.counterOver,
                      ]}
                    >
                      {remaining} left
                    </Text>
                    <Pressable
                      onPress={() => void save(false)}
                      disabled={!canSave}
                      accessibilityRole="button"
                      accessibilityLabel="Save Day 1 draft"
                      accessibilityState={{ disabled: !canSave }}
                      style={({ pressed }) => [
                        styles.submit,
                        !canSave && styles.submitDisabled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.submitLabel}>
                        {saving ? 'saving…' : waiting.savedEntry ? 'update' : 'save'}
                      </Text>
                    </Pressable>
                  </View>

                  {piiPrompt ? (
                    <View style={styles.piiPanel}>
                      <Text style={styles.piiTitle}>This may reveal who you are.</Text>
                      <Text style={styles.piiBody}>
                        We noticed{' '}
                        {piiPrompt.length > 0 ? piiPrompt.join(', ') : 'personal details'}
                        . This becomes what your first partner reads — remove them, or
                        keep them knowing they will be visible.
                      </Text>
                      <View style={styles.piiActions}>
                        <Pressable
                          onPress={() => setPiiPrompt(null)}
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.piiSecondary,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={styles.piiSecondaryLabel}>edit</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => void save(true)}
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.piiPrimary,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={styles.piiPrimaryLabel}>save anyway</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}

                  {saveError ? (
                    <Text accessibilityLiveRegion="polite" style={styles.error}>
                      {saveError}
                    </Text>
                  ) : null}
                  {flash ? (
                    <Text accessibilityLiveRegion="polite" style={styles.flash}>
                      {flash}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.note}>
                  This is saved on your account, not on this device alone. If you sign
                  in from a different phone, it will still be here.
                </Text>
              </>
            ) : (
              <Text style={styles.empty}>Loading your Day 1…</Text>
            )}

            <Pressable
              onPress={() => router.push('/support' as Href)}
              accessibilityRole="link"
              accessibilityLabel="Find crisis support"
              hitSlop={12}
              style={({ pressed }) => [styles.supportLink, pressed && styles.pressed]}
            >
              <Text style={styles.supportLabel}>if tonight is heavy, find support</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (typeof err.body === 'object' && err.body !== null && 'error' in err.body) {
      const e = (err.body as { error?: unknown }).error;
      if (typeof e === 'string') return e;
    }
    return err.message;
  }
  return 'Something went wrong. Try again in a moment.';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: brand.line,
  },
  back: { minHeight: 44, justifyContent: 'center' },
  backLabel: { ...type.body, color: brand.inkMid },
  title: { ...type.display, color: brand.ink, fontSize: 26, lineHeight: 32, marginTop: space.sm },
  subtitle: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs, lineHeight: 18 },
  scroll: { padding: space.lg, paddingBottom: space.huge },
  promptCard: {
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
    marginBottom: space.lg,
  },
  kicker: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.6, fontSize: 10 },
  prompt: { ...type.displayItalic, color: brand.ink, fontSize: 22, lineHeight: 30, marginTop: space.sm },
  compose: {
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  moodRow: { marginBottom: space.md },
  moodLabel: { ...type.eyebrow, color: brand.inkMid, fontSize: 10, marginBottom: space.xs },
  moodOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  moodChip: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: brand.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  moodChipOn: { borderColor: brand.rose, backgroundColor: brand.surface },
  moodEmoji: { fontSize: 18 },
  input: { ...type.body, color: brand.ink, minHeight: 160, padding: 0 },
  composeMeta: {
    marginTop: space.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: { ...type.bodySmall, color: brand.inkMid },
  counterLow: { color: brand.gold },
  counterOver: { color: brand.danger },
  submit: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitLabel: { ...type.bodyStrong, color: brand.void, fontSize: 15 },
  piiPanel: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.gold,
    backgroundColor: brand.surface,
  },
  piiTitle: { ...type.bodyStrong, color: brand.ink },
  piiBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs, lineHeight: 19 },
  piiActions: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  piiSecondary: {
    minHeight: 40,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: brand.line,
    justifyContent: 'center',
  },
  piiSecondaryLabel: { ...type.bodyStrong, color: brand.ink, fontSize: 13 },
  piiPrimary: {
    minHeight: 40,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.gold,
    justifyContent: 'center',
  },
  piiPrimaryLabel: { ...type.bodyStrong, color: brand.void, fontSize: 13 },
  error: { ...type.bodySmall, color: brand.danger, marginTop: space.sm },
  flash: { ...type.bodySmall, color: brand.rose, marginTop: space.sm },
  note: {
    marginTop: space.xl,
    ...type.bodySmall,
    color: brand.inkFaint,
    textAlign: 'center',
    lineHeight: 18,
  },
  empty: { ...type.body, color: brand.inkMid, textAlign: 'center', paddingVertical: space.xl },
  supportLink: { marginTop: space.xxl, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  supportLabel: { ...type.bodySmall, color: brand.inkMid, textDecorationLine: 'underline' },
  pressed: { opacity: 0.78 },
});
