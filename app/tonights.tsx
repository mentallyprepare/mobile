import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import {
  getTonightsQuestion,
  isPiiRejection,
  submitTonightsQuestion,
  TONIGHTS_MAX_CHARS,
  type TonightsFeed,
  type TonightsWhisper,
} from '../src/api/tonights';
import { ApiError } from '../src/api';
import { brand, radius, space, type } from '../src/design';

const MOODS = ['🌓', '🌘', '🌑', '🌒', '🌕', '☁️', '⚡'] as const;

/**
 * Tonight's Question — the community writing prompt for users still waiting
 * to be paired. One prompt tonight, rotating daily. The user writes; a
 * handful of anonymous whispers from other waiting users appear alongside.
 *
 * Only for unmatched users; the server returns `{matched: true}` for
 * matched users and this screen routes them to the ritual instead.
 *
 * The PII path is recoverable: if the server flags an entry as
 * identity-revealing, the writer is shown the warning and can choose to
 * save anyway. A crisis flag routes to /support after saving.
 */
export default function TonightsQuestionScreen() {
  const router = useRouter();

  const [feed, setFeed] = useState<TonightsFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [mood, setMood] = useState<string>('🌓');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [piiPrompt, setPiiPrompt] = useState<string[] | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getTonightsQuestion();
      if (result.matched) {
        router.replace('/rooms' as Href);
        return;
      }
      setFeed(result);
      if (result.myEntry) {
        setText(result.myEntry.text);
        setMood(result.myEntry.mood);
      }
    } catch (err) {
      setLoadError(messageFor(err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Classic on-mount fetch — setState calls happen inside `load` on
    // completion, not synchronously in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function submit(piiConfirmed: boolean) {
    const content = text.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setPiiPrompt(null);
    try {
      const result = await submitTonightsQuestion(content, mood, piiConfirmed);
      setFlash('saved for tonight.');
      if (result.safety.crisis) {
        // Entry was still saved; route to the helplines screen.
        router.push('/support' as Href);
      }
      await load();
    } catch (err) {
      if (isPiiRejection(err)) {
        setPiiPrompt(err.body.piiFlags);
      } else {
        setSubmitError(messageFor(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = TONIGHTS_MAX_CHARS - text.length;
  const canSubmit = text.trim().length > 0 && !submitting && remaining >= 0;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: "Tonight's Question" }} />
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
              Tonight&apos;s Question
            </Text>
            <Text style={styles.subtitle}>
              For anyone still waiting to be paired.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {loading && feed === null ? (
              <View style={styles.loading}>
                <ActivityIndicator color={brand.rose} />
              </View>
            ) : loadError ? (
              <View style={styles.loadFailure}>
                <Text style={styles.loadFailureText}>{loadError}</Text>
                <Pressable
                  onPress={() => void load()}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                >
                  <Text style={styles.retryLabel}>Try again</Text>
                </Pressable>
              </View>
            ) : feed ? (
              <>
                <View style={styles.promptCard}>
                  <Text style={styles.kicker}>TONIGHT</Text>
                  <Text style={styles.prompt}>{feed.prompt}</Text>
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
                      setText(v.slice(0, TONIGHTS_MAX_CHARS));
                      if (submitError) setSubmitError(null);
                      if (piiPrompt) setPiiPrompt(null);
                    }}
                    multiline
                    placeholder="write for tonight."
                    placeholderTextColor={brand.inkFaint}
                    accessibilityLabel="Your entry"
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
                      onPress={() => void submit(false)}
                      disabled={!canSubmit}
                      accessibilityRole="button"
                      accessibilityLabel={
                        feed.myEntry ? 'Update tonight&apos;s entry' : 'Save tonight&apos;s entry'
                      }
                      accessibilityState={{ disabled: !canSubmit }}
                      style={({ pressed }) => [
                        styles.submit,
                        !canSubmit && styles.submitDisabled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.submitLabel}>
                        {submitting ? 'saving…' : feed.myEntry ? 'update' : 'save'}
                      </Text>
                    </Pressable>
                  </View>

                  {piiPrompt ? (
                    <View style={styles.piiPanel}>
                      <Text style={styles.piiTitle}>
                        This may reveal who you are.
                      </Text>
                      <Text style={styles.piiBody}>
                        We noticed{' '}
                        {piiPrompt.length > 0 ? piiPrompt.join(', ') : 'personal details'}
                        . This space is anonymous — remove them, or keep them
                        knowing they will be visible to others waiting tonight.
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
                          onPress={() => void submit(true)}
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

                  {submitError ? (
                    <Text accessibilityLiveRegion="polite" style={styles.error}>
                      {submitError}
                    </Text>
                  ) : null}
                  {flash ? (
                    <Text accessibilityLiveRegion="polite" style={styles.flash}>
                      {flash}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.presence}>
                  {feed.writerCount === 1
                    ? '1 person wrote to this tonight.'
                    : `${feed.writerCount} people wrote to this tonight.`}
                  {feed.nightsWritten > 0
                    ? ` · You've written ${feed.nightsWritten} night${feed.nightsWritten === 1 ? '' : 's'}.`
                    : ''}
                </Text>

                {feed.whispers.length > 0 ? (
                  <View style={styles.whispers}>
                    <Text style={styles.whispersTitle}>whispers from tonight</Text>
                    {feed.whispers.map((w, i) => (
                      <WhisperCard key={i} whisper={w} />
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}

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

function WhisperCard({ whisper }: { whisper: TonightsWhisper }) {
  return (
    <View style={styles.whisper}>
      <Text style={styles.whisperMood}>{whisper.mood}</Text>
      <Text style={styles.whisperText}>{whisper.text}</Text>
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
  subtitle: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs },
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
  prompt: {
    ...type.displayItalic,
    color: brand.ink,
    fontSize: 22,
    lineHeight: 30,
    marginTop: space.sm,
  },
  compose: {
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  moodRow: {
    marginBottom: space.md,
  },
  moodLabel: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 10,
    marginBottom: space.xs,
  },
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
  input: {
    ...type.body,
    color: brand.ink,
    minHeight: 120,
    padding: 0,
  },
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
  presence: {
    ...type.bodySmall,
    color: brand.inkMid,
    marginTop: space.xl,
    marginBottom: space.md,
    textAlign: 'center',
  },
  whispers: { marginTop: space.md, gap: space.md },
  whispersTitle: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 10,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  whisper: {
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
    flexDirection: 'row',
    gap: space.md,
  },
  whisperMood: { fontSize: 18 },
  whisperText: { ...type.body, color: brand.ink, flex: 1, lineHeight: 22 },
  loading: { paddingVertical: space.xl, alignItems: 'center' },
  loadFailure: { paddingVertical: space.xl, alignItems: 'center', gap: space.md },
  loadFailureText: { ...type.body, color: brand.inkMid, textAlign: 'center' },
  retry: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryLabel: { ...type.bodyStrong, color: brand.void, fontSize: 14 },
  supportLink: {
    marginTop: space.xxl,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportLabel: {
    ...type.bodySmall,
    color: brand.inkMid,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.78 },
});
