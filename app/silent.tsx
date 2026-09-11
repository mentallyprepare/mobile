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
  getSilentFeed,
  getSilentPresence,
  SILENT_MAX_CHARS,
  submitSilentLine,
  toggleSilentResonance,
  type SilentLine,
} from '../src/api/silent';
import { ApiError } from '../src/api';
import { brand, radius, space, type } from '../src/design';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

/**
 * The Silent Room. One line, no replies, no reactions except a quiet
 * "resonated with this." Lines live seven days and vanish.
 *
 * This screen is a Utility surface with a hint of atmosphere — Daylight
 * shell, but the compose card and lines carry a small, quiet gravity. The
 * safety scanner on the server can intercept a submission that reads as a
 * crisis and return a helplines payload; when it does, this screen routes
 * to /support rather than trying to hold the moment inline.
 */
export default function SilentRoomScreen() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes

  const [presence, setPresence] = useState<number | null>(null);
  const [feed, setFeed] = useState<SilentLine[] | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [presenceRes, feedRes] = await Promise.all([
        getSilentPresence(),
        getSilentFeed(),
      ]);
      setPresence(presenceRes.count);
      setFeed(feedRes.lines);
      setNextCursor(feedRes.next_cursor);
    } catch (err) {
      setLoadError(messageFor(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Classic on-mount fetch. The setState calls happen inside `load` on
    // completion, not synchronously in the effect body — the rule
    // over-fires on this pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function submit() {
    const content = draft.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitSilentLine(content);
      if (result.status === 'crisis_intercepted') {
        // The server has already flagged this internally. Move to the
        // helplines screen rather than answer the person here.
        router.push('/support' as Href);
        setDraft('');
        return;
      }
      setDraft('');
      setFlash(
        result.status === 'approved'
          ? t('silent.flash_shared')
          : t('silent.flash_held'),
      );
      await load();
    } catch (err) {
      setSubmitError(messageFor(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function loadMore() {
    if (nextCursor === null || loading) return;
    try {
      const more = await getSilentFeed(nextCursor);
      setFeed((prev) => (prev ? [...prev, ...more.lines] : more.lines));
      setNextCursor(more.next_cursor);
    } catch {
      // A failure to extend the feed keeps what is already on screen and
      // shows nothing new — no need to interrupt.
    }
  }

  async function resonate(line: SilentLine) {
    // Optimistic — the room's quiet acknowledgement should feel immediate.
    setFeed((prev) =>
      prev
        ? prev.map((l) =>
            l.id === line.id
              ? {
                  ...l,
                  resonated: !l.resonated,
                  resonance_count: l.resonance_count + (l.resonated ? -1 : 1),
                }
              : l,
          )
        : prev,
    );
    try {
      const result = await toggleSilentResonance(line.id);
      setFeed((prev) =>
        prev
          ? prev.map((l) =>
              l.id === line.id
                ? { ...l, resonated: result.resonated, resonance_count: result.resonance_count }
                : l,
            )
          : prev,
      );
    } catch {
      // Roll back on failure.
      setFeed((prev) =>
        prev
          ? prev.map((l) =>
              l.id === line.id
                ? {
                    ...l,
                    resonated: line.resonated,
                    resonance_count: line.resonance_count,
                  }
                : l,
            )
          : prev,
      );
    }
  }

  const remaining = SILENT_MAX_CHARS - draft.length;
  const canSubmit = draft.trim().length > 0 && !submitting && remaining >= 0;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t('silent.screen_title') }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t('silent.back_a11y')}
              hitSlop={12}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Text style={styles.backLabel}>{t('silent.back')}</Text>
            </Pressable>
            <Text style={styles.title} accessibilityRole="header">
              {t('silent.title')}
            </Text>
            <Text style={styles.subtitle}>{t('silent.subtitle')}</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.compose}>
              <TextInput
                value={draft}
                onChangeText={(v) => {
                  setDraft(v.slice(0, SILENT_MAX_CHARS));
                  if (submitError) setSubmitError(null);
                }}
                multiline
                placeholder={t('silent.placeholder')}
                placeholderTextColor={brand.inkFaint}
                accessibilityLabel={t('silent.input_a11y')}
                textAlignVertical="top"
                style={styles.input}
              />
              <View style={styles.composeMeta}>
                <Text
                  style={[
                    styles.counter,
                    remaining < 20 && styles.counterLow,
                    remaining < 0 && styles.counterOver,
                  ]}
                >
                  {remaining} {t('silent.chars_left')}
                </Text>
                <Pressable
                  onPress={() => void submit()}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityLabel={t('silent.submit_a11y')}
                  accessibilityState={{ disabled: !canSubmit }}
                  style={({ pressed }) => [
                    styles.submit,
                    !canSubmit && styles.submitDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.submitLabel}>
                    {submitting ? t('silent.sharing') : t('silent.share')}
                  </Text>
                </Pressable>
              </View>
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

            {presence !== null ? (
              <Text style={styles.presence}>
                {presence === 1
                  ? `1 ${t('silent.person_wrote')}`
                  : `${presence} ${t('silent.people_wrote')}`}
              </Text>
            ) : null}

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
                  <Text style={styles.retryLabel}>{t('silent.retry')}</Text>
                </Pressable>
              </View>
            ) : feed && feed.length === 0 ? (
              <Text style={styles.empty}>{t('silent.empty')}</Text>
            ) : (
              <View style={styles.feed}>
                {feed?.map((line) => (
                  <LineCard key={line.id} line={line} onResonate={() => void resonate(line)} />
                ))}
                {nextCursor !== null ? (
                  <Pressable
                    onPress={() => void loadMore()}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.more, pressed && styles.pressed]}
                  >
                    <Text style={styles.moreLabel}>{t('silent.load_more')}</Text>
                  </Pressable>
                ) : null}
              </View>
            )}

            <Pressable
              onPress={() => router.push('/support' as Href)}
              accessibilityRole="link"
              accessibilityLabel={t('silent.support_a11y')}
              hitSlop={12}
              style={({ pressed }) => [styles.supportLink, pressed && styles.pressed]}
            >
              <Text style={styles.supportLabel}>{t('silent.support_link')}</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function LineCard({ line, onResonate }: { line: SilentLine; onResonate: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.content}>{line.content}</Text>
      <View style={styles.cardMeta}>
        <Pressable
          onPress={onResonate}
          accessibilityRole="button"
          accessibilityLabel={
            line.resonated ? t('silent.resonate_off_a11y') : t('silent.resonate_on_a11y')
          }
          accessibilityState={{ selected: line.resonated }}
          hitSlop={12}
          style={({ pressed }) => [
            styles.resonateChip,
            line.resonated && styles.resonateChipOn,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.resonateLabel,
              line.resonated && styles.resonateLabelOn,
            ]}
          >
            {line.resonated ? t('silent.resonated') : t('silent.resonate')}
            {line.resonance_count > 0 ? ` · ${line.resonance_count}` : ''}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    // The server's error strings are already user-facing and quiet.
    if (typeof err.body === 'object' && err.body !== null && 'message' in err.body) {
      const m = (err.body as { message?: unknown }).message;
      if (typeof m === 'string') return m;
    }
    return err.message;
  }
  return t('silent.generic_error');
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
  compose: {
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  input: {
    ...type.body,
    color: brand.ink,
    minHeight: 88,
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
  error: { ...type.bodySmall, color: brand.danger, marginTop: space.sm },
  flash: { ...type.bodySmall, color: brand.rose, marginTop: space.sm },
  presence: {
    ...type.bodySmall,
    color: brand.inkMid,
    marginTop: space.xl,
    marginBottom: space.md,
    textAlign: 'center',
  },
  feed: { gap: space.md },
  card: {
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  content: { ...type.body, color: brand.ink, lineHeight: 22 },
  cardMeta: {
    marginTop: space.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resonateChip: {
    minHeight: 32,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: brand.line,
    justifyContent: 'center',
  },
  resonateChipOn: { borderColor: brand.rose, backgroundColor: brand.surface },
  resonateLabel: { ...type.bodySmall, color: brand.inkMid },
  resonateLabelOn: { color: brand.rose },
  more: {
    minHeight: 44,
    marginTop: space.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreLabel: { ...type.bodySmall, color: brand.rose },
  empty: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.xl,
    marginBottom: space.xl,
    textAlign: 'center',
  },
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
