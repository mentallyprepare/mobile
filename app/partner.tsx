import { useMemo, useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { useMeShared } from '../src/api/me-provider';
import {
  commentOnPartnerEntry,
  COMMENT_MAX_CHARS,
  reactToPartnerEntry,
  VALID_REACTIONS,
  type ReactionEmoji,
} from '../src/api/interactions';
import { ApiError } from '../src/api';
import { brand, radius, space, type } from '../src/design';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';
import type { PartnerEntryPresence } from '../src/api/types-me';

/**
 * Partner-entry reader — what the other person wrote on previous nights.
 *
 * The server unlocks each partner entry at midnight after the partner
 * sealed it. Today's entry never crosses; presence-only lives on the moon
 * elsewhere. Each unlocked entry gets a reaction chip row (six emoji the
 * server accepts) and a comment button that opens an inline sheet.
 *
 * This is the surface that turns the ritual from single-player writing
 * into a two-sided exchange without a live thread.
 */
export default function PartnerReaderScreen() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes
  const { data, reload } = useMeShared();

  const entries = useMemo(() => {
    // Most recent night first — the writer usually cares about tonight before
    // Night 3.
    return [...(data?.partnerEntries ?? [])].sort((a, b) => b.day - a.day);
  }, [data?.partnerEntries]);

  // The server sends the exact next-unlock as an ISO timestamp — rendering
  // it in the device's own timezone is more honest than saying "midnight"
  // and letting a US user guess which midnight it means.
  const nextUnlockCopy = useMemo(() => {
    const iso = data?.partnerStatus?.nextUnsealAt;
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [data?.partnerStatus?.nextUnsealAt]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t('partner.screen_title') }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t('partner.back_a11y')}
              hitSlop={12}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <Text style={styles.backLabel}>{t('partner.back')}</Text>
            </Pressable>
            <Text style={styles.title} accessibilityRole="header">
              {t('partner.title')}
            </Text>
            <Text style={styles.subtitle}>
              {nextUnlockCopy
                ? `${t('partner.subtitle_time_prefix')}${nextUnlockCopy}${t('partner.subtitle_time_suffix')}`
                : t('partner.subtitle_plain')}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!data?.match ? (
              <EmptyPanel
                title={t('partner.empty_nomatch_title')}
                body={t('partner.empty_nomatch_body')}
              />
            ) : entries.length === 0 ? (
              <EmptyPanel
                title={t('partner.empty_locked_title')}
                body={
                  nextUnlockCopy
                    ? `${t('partner.empty_locked_body_time_prefix')}${nextUnlockCopy}${t('partner.empty_locked_body_time_suffix')}`
                    : t('partner.empty_locked_body_plain')
                }
              />
            ) : (
              entries.map((entry) => (
                <EntryCard key={entry.day} entry={entry} onChange={() => void reload()} />
              ))
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function EntryCard({
  entry,
  onChange,
}: {
  entry: PartnerEntryPresence;
  onChange: () => void;
}) {
  const { data } = useMeShared();
  const dayReactions = (data?.reactions ?? []).filter((r) => r.day === entry.day);
  const dayComments = (data?.comments ?? []).filter((c) => c.day === entry.day);
  const myReactions = new Set(dayReactions.filter((r) => r.from === 'me').map((r) => r.emoji));

  const existingMyComment = dayComments.find((c) => c.from === 'me');
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState(existingMyComment?.text ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleReaction(emoji: ReactionEmoji) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await reactToPartnerEntry(entry.day, emoji);
      onChange();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  async function sendComment() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      await commentOnPartnerEntry(entry.day, text);
      setDrafting(false);
      onChange();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.night}>
          {t('partner.night_prefix')}
          {String(entry.day).padStart(2, '0')}
        </Text>
        {entry.mood ? <Text style={styles.mood}>{entry.mood}</Text> : null}
      </View>
      <Text style={styles.body}>{entry.text}</Text>

      <View style={styles.reactionRow}>
        {(VALID_REACTIONS as readonly ReactionEmoji[]).map((emoji) => {
          const active = myReactions.has(emoji);
          const partnerHas = dayReactions.some((r) => r.emoji === emoji && r.from === 'partner');
          return (
            <Pressable
              key={emoji}
              onPress={() => void toggleReaction(emoji)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={`${t('partner.react_a11y_prefix')}${emoji}${active ? t('partner.react_already_sent') : ''}`}
              accessibilityState={{ selected: active, disabled: busy }}
              hitSlop={4}
              style={({ pressed }) => [
                styles.reactionChip,
                active && styles.reactionChipMine,
                partnerHas && !active && styles.reactionChipTheirs,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      {dayComments.length > 0 ? (
        <View style={styles.commentList}>
          {dayComments.map((c, i) => (
            <View key={i} style={styles.comment}>
              <Text style={styles.commentFrom}>
                {c.from === 'me' ? t('partner.from_you') : t('partner.from_them')}
              </Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!drafting ? (
        <Pressable
          onPress={() => setDrafting(true)}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={
            existingMyComment
              ? t('partner.comment_edit_a11y')
              : t('partner.comment_write_a11y')
          }
          hitSlop={8}
          style={({ pressed }) => [styles.commentBtn, pressed && styles.pressed]}
        >
          <Text style={styles.commentBtnLabel}>
            {existingMyComment ? t('partner.comment_edit') : t('partner.comment_write')}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.commentDraft}>
          <TextInput
            value={draft}
            onChangeText={(v) => setDraft(v.slice(0, COMMENT_MAX_CHARS))}
            multiline
            placeholder={t('partner.comment_placeholder')}
            placeholderTextColor={brand.inkFaint}
            accessibilityLabel={t('partner.comment_input_a11y')}
            textAlignVertical="top"
            style={styles.commentInput}
          />
          <View style={styles.commentActions}>
            <Text style={styles.commentCounter}>
              {COMMENT_MAX_CHARS - draft.length} {t('partner.chars_left')}
            </Text>
            <View style={styles.commentBtnRow}>
              <Pressable
                onPress={() => {
                  setDrafting(false);
                  setDraft(existingMyComment?.text ?? '');
                  setError(null);
                }}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={t('partner.cancel_a11y')}
                style={({ pressed }) => [styles.commentSecondary, pressed && styles.pressed]}
              >
                <Text style={styles.commentSecondaryLabel}>{t('partner.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => void sendComment()}
                disabled={busy || draft.trim().length === 0}
                accessibilityRole="button"
                accessibilityLabel={
                  existingMyComment ? t('partner.send_update_a11y') : t('partner.send_a11y')
                }
                style={({ pressed }) => [
                  styles.commentPrimary,
                  (busy || draft.trim().length === 0) && styles.commentPrimaryDim,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.commentPrimaryLabel}>
                  {busy ? '…' : existingMyComment ? t('partner.update') : t('partner.send')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {busy && !drafting ? (
        <ActivityIndicator color={brand.rose} style={styles.busy} size="small" />
      ) : null}
    </View>
  );
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return t('partner.generic_error');
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
  title: {
    ...type.display,
    color: brand.ink,
    fontSize: 26,
    lineHeight: 32,
    marginTop: space.sm,
  },
  subtitle: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs },
  scroll: { padding: space.lg, paddingBottom: space.huge },
  empty: { paddingVertical: space.huge, alignItems: 'center' },
  emptyTitle: { ...type.displayItalic, color: brand.ink, fontSize: 22 },
  emptyBody: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.md,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },
  card: {
    marginBottom: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  night: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.6, fontSize: 10 },
  mood: { fontSize: 18 },
  body: { ...type.body, color: brand.ink, marginTop: space.md, lineHeight: 24 },
  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.lg,
  },
  reactionChip: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: brand.line,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  reactionChipMine: { borderColor: brand.rose, backgroundColor: brand.surface },
  reactionChipTheirs: { borderColor: brand.gold },
  reactionEmoji: { fontSize: 18 },
  commentList: { marginTop: space.md, gap: space.sm },
  comment: {
    padding: space.sm,
    borderLeftWidth: 2,
    borderLeftColor: brand.line,
    paddingLeft: space.md,
  },
  commentFrom: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  commentText: { ...type.body, color: brand.ink, marginTop: 4, lineHeight: 22 },
  commentBtn: {
    marginTop: space.md,
    minHeight: 40,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  commentBtnLabel: { ...type.bodySmall, color: brand.rose, textDecorationLine: 'underline' },
  commentDraft: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
  },
  commentInput: {
    ...type.body,
    color: brand.ink,
    minHeight: 60,
    padding: 0,
  },
  commentActions: {
    marginTop: space.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentCounter: { ...type.bodySmall, color: brand.inkMid },
  commentBtnRow: { flexDirection: 'row', gap: space.sm },
  commentSecondary: {
    minHeight: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: brand.line,
    justifyContent: 'center',
  },
  commentSecondaryLabel: { ...type.bodyStrong, color: brand.ink, fontSize: 13 },
  commentPrimary: {
    minHeight: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    justifyContent: 'center',
  },
  commentPrimaryDim: { opacity: 0.5 },
  commentPrimaryLabel: { ...type.bodyStrong, color: brand.void, fontSize: 13 },
  error: { ...type.bodySmall, color: brand.danger, marginTop: space.sm },
  busy: { marginTop: space.sm, alignSelf: 'flex-start' },
  pressed: { opacity: 0.78 },
});
