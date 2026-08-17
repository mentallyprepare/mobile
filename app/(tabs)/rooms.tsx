import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  type ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import LivingNightScene from '../../src/components/ritual/LivingNightScene';
import {
  LoadFailure,
  LoadPlaceholder,
  StaleNotice,
} from '../../src/components/app/LoadFailure';
import { brand, radius, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';
import { describeLoad } from '../../src/api/load-state';
import { sealEntry } from '../../src/api/entries';
import { drafts } from '../../src/drafts';
import { failureDetail } from '../../src/api/failures';
import { ApiError } from '../../src/api';

/**
 * Milestone notes for the sealed state. Night 21 is deliberately omitted —
 * the Day-21 reveal CTA at the top of the sheet is the moment there. These
 * two are quiet acknowledgements of showing up, not celebrations.
 */
function milestoneFor(
  night: number,
): { kicker: string; title: string; body: string } | null {
  if (night === 7) {
    return {
      kicker: 'NIGHT 7',
      title: 'A week in.',
      body: 'You kept showing up. That was the whole ask.',
    };
  }
  if (night === 14) {
    return {
      kicker: 'NIGHT 14',
      title: 'Past the halfway point.',
      body: 'Two-thirds of the ritual is behind you. Seven nights to go.',
    };
  }
  return null;
}

export default function Night() {
  const router = useRouter();
  const { data, loading, error: loadError, hasLoaded, reload } = useMeShared();
  const userId = data?.user?.id ?? 0;
  const activeNight = data?.match?.day ?? 0;
  const scopeKey = `${userId}:${activeNight}`;
  const scope = { userId, night: activeNight };
  const [draftState, setDraftState] = useState({ scopeKey: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSealed, setJustSealed] = useState(false);
  const [restoredScope, setRestoredScope] = useState<string | null>(null);
  const [mood, setMood] = useState<string>('🌓');
  const scrollRef = useRef<ScrollView | null>(null);

  // The mood emojis the web app sends. Kept in sync with routes/app.js so a
  // sealed entry reads the same on both surfaces.
  const MOODS = ['🌓', '🌘', '🌑', '🌒', '🌕', '☁️', '⚡'] as const;

  // Keep text attached to the account and night it belongs to. When the
  // provider moves to another room, the old draft cannot flash or autosave
  // into the new scope while its local copy is loading.
  const draft = draftState.scopeKey === scopeKey ? draftState.text : '';
  const setDraft = useCallback(
    (update: string | ((current: string) => string)) => {
      setDraftState((current) => {
        const currentText = current.scopeKey === scopeKey ? current.text : '';
        return {
          scopeKey,
          text: typeof update === 'function' ? update(currentText) : update,
        };
      });
    },
    [scopeKey],
  );
  const draftRestored = restoredScope === scopeKey;

  // Restore anything left unsealed on this device for this night.
  useEffect(() => {
    let alive = true;
    void drafts.load({ userId, night: activeNight }).then((saved) => {
      if (!alive) return;
      // Never overwrite something already being typed: if the editor has
      // content, whatever is on disk is older than what is on screen.
      if (saved) setDraft((current) => (current.length > 0 ? current : saved));
      setRestoredScope(scopeKey);
    });
    return () => {
      alive = false;
    };
  }, [userId, activeNight, scopeKey, setDraft]);

  // Autosave, debounced, and only once we know what was already stored.
  useEffect(() => {
    if (!draftRestored) return;
    const handle = setTimeout(() => {
      void drafts.save({ userId, night: activeNight }, draft);
    }, 800);
    return () => clearTimeout(handle);
  }, [draft, draftRestored, userId, activeNight]);

  /**
   * Brings the editor and the seal control into view when the keyboard opens.
   * The night scene above the sheet is deliberately tall, so on a short Android
   * screen the button that ends the ritual would otherwise be somewhere below
   * the fold with a keyboard covering the rest.
   */
  const revealEditor = useCallback(() => {
    // One frame after the keyboard animation starts, so the scroll lands on
    // the resized layout rather than the old one.
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  const view = describeLoad({ loading, error: loadError, hasLoaded });

  if (view === 'first-load') {
    return (
      <CosmicScreen>
        <LoadPlaceholder label="Opening your room" />
      </CosmicScreen>
    );
  }

  // A room we could not fetch must never be drawn as "before night one".
  if (view === 'failed') {
    return (
      <CosmicScreen>
        <LoadFailure error={loadError} onRetry={() => void reload()} busy={loading} />
      </CosmicScreen>
    );
  }

  const staleBanner =
    view === 'stale' ? (
      <StaleNotice error={loadError} onRetry={() => void reload()} busy={loading} />
    ) : null;

  const match = data?.match ?? null;

  if (!match) {
    return (
      <CosmicScreen contentStyle={styles.immersiveContent}>
        <LivingNightScene
          night={0}
          prompt=""
          entries={[]}
          userId={data?.user?.id ?? 0}
          sealed={false}
          partnerPresent={false}
          inactive
        />

        <View style={styles.sheet}>
          {staleBanner}
          <Text style={styles.sheetLabel}>BEFORE NIGHT ONE</Text>
          <Text style={styles.sheetTitle}>Prepare your side of the room.</Text>
          <Text style={styles.sheetBody}>
            Your pattern and cultural shelf give a future match real context. The app never
            invents a partner, a note, or a connection.
          </Text>

          <SetupAction
            index="01"
            title="Complete your pattern"
            detail="Eleven reflective, non-diagnostic questions"
            onPress={() => router.push('/scan')}
          />
          <SetupAction
            index="02"
            title="Build your cultural shelf"
            detail="Songs, film, book, and one memory"
            onPress={() => router.push('/create')}
          />
          <SetupAction
            index="03"
            title="Write your Day 1"
            detail="It becomes the first note your match reads"
            onPress={() => router.push('/waiting' as Href)}
          />
        </View>
      </CosmicScreen>
    );
  }

  const night = match.day;
  const prompt = match.currentPrompt;
  const partnerSealed = data?.partnerStatus?.partnerHasWrittenToday ?? false;
  const sealedTonight = !!data?.entries?.some((entry) => entry.day === night);

  async function onSeal() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setError(null);
    setJustSealed(false);
    try {
      await sealEntry({ text: draft.trim(), mood, selectedPrompt: prompt });
      // Sealed is the one moment the local copy is no longer needed.
      await drafts.discard(scope);
      setDraft('');
      await reload();
      setJustSealed(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `${failureDetail(err)} Your draft is still here.`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <CosmicScreen
      contentStyle={styles.immersiveContent}
      avoidKeyboard={!sealedTonight}
      scrollRef={scrollRef}
    >
      <LivingNightScene
        night={night}
        prompt={prompt}
        entries={data?.entries ?? []}
        userId={data?.user?.id ?? 0}
        sealed={sealedTonight}
        partnerPresent={partnerSealed}
        celebrate={justSealed}
      />

      <View style={styles.sheet}>
        {staleBanner}
        {data?.reveal?.available ? (
          <Pressable
            onPress={() => router.push('/reveal' as Href)}
            accessibilityRole="button"
            accessibilityLabel={
              data.reveal.myChoice
                ? 'Open Day 21 reveal — your choice is locked'
                : 'Open Day 21 reveal — choose what to share'
            }
            style={({ pressed }) => [styles.revealCta, pressed && styles.pressed]}
          >
            <Text style={styles.revealKicker}>DAY 21</Text>
            <Text style={styles.revealTitle}>
              {data.reveal.revealed
                ? 'Reveal is open.'
                : data.reveal.myChoice
                  ? 'You chose. Waiting for the other person.'
                  : 'Choose what you want to share.'}
            </Text>
            <Text style={styles.revealBody}>
              {data.reveal.revealed
                ? 'The partnership can be seen.'
                : data.reveal.myChoice
                  ? 'The choice is locked. This screen will update when your partner chooses.'
                  : 'Both of you decide separately. Either one anonymous keeps both private.'}
            </Text>
            <Text style={styles.revealArrow}>open →</Text>
          </Pressable>
        ) : null}
        {sealedTonight ? (
          <View style={styles.sealedState}>
            <View style={styles.sealedMark}>
              <View style={styles.sealedMarkCore} />
            </View>
            <Text style={styles.sheetLabel}>SEALED LOCALLY AND ON YOUR ACCOUNT</Text>
            <Text style={styles.sheetTitle}>Your note became a star.</Text>
            <Text style={styles.sheetBody}>
              Nothing more is required tonight. This note stays private to your account.
            </Text>
            {(data?.partnerEntries?.length ?? 0) > 0 ? (
              <Pressable
                onPress={() => router.push('/partner' as Href)}
                accessibilityRole="button"
                accessibilityLabel="Read what your partner wrote on earlier nights"
                hitSlop={10}
                style={({ pressed }) => [styles.readPartner, pressed && styles.pressed]}
              >
                <Text style={styles.readPartnerLabel}>read what they wrote →</Text>
              </Pressable>
            ) : null}
            {milestoneFor(night) ? (
              <View style={styles.milestone} accessibilityLiveRegion="polite">
                <Text style={styles.milestoneKicker}>
                  {milestoneFor(night)!.kicker}
                </Text>
                <Text style={styles.milestoneTitle}>
                  {milestoneFor(night)!.title}
                </Text>
                <Text style={styles.milestoneBody}>
                  {milestoneFor(night)!.body}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={styles.sheetLabel}>YOUR PRIVATE RESPONSE</Text>
            <Text style={styles.sheetTitle}>Write before you polish it.</Text>
            <View style={styles.moodRow}>
              <Text style={styles.moodLabel}>tonight&apos;s mood</Text>
              <View style={styles.moodOptions}>
                {MOODS.map((m) => {
                  const active = mood === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMood(m)}
                      disabled={busy}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active, disabled: busy }}
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
            <View style={styles.inputShell}>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                onFocus={revealEditor}
                placeholder="What is true for you tonight?"
                placeholderTextColor={brand.inkLow}
                multiline
                textAlignVertical="top"
                editable={!busy}
                maxLength={5000}
                accessibilityLabel="Tonight's private note"
              />
              <Text style={styles.counter}>{draft.length}/5000</Text>
            </View>
            <Pressable
              onPress={() => router.push('/support' as Href)}
              accessibilityRole="button"
              accessibilityLabel="Find support"
              accessibilityHint="Crisis helplines by region"
              hitSlop={10}
              style={styles.supportLink}
            >
              <Text style={styles.supportLabel}>if tonight is heavy, find support</Text>
            </Pressable>

            <View style={styles.privacyRow}>
              <View style={styles.privacyDot} />
              <Text style={styles.privacy}>
                Only you can see this note.
              </Text>
            </View>
            {error ? (
              <Text accessibilityLiveRegion="polite" style={styles.error}>
                {error}
              </Text>
            ) : null}
            <Pressable
              onPress={onSeal}
              disabled={!draft.trim() || busy}
              accessibilityRole="button"
              accessibilityLabel="Seal tonight's note"
              style={({ pressed }) => [
                styles.primary,
                (!draft.trim() || busy) && styles.primaryDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryText}>{busy ? 'Sealing…' : 'Seal as a star'}</Text>
              <Text style={styles.primaryArrow}>↑</Text>
            </Pressable>
          </>
        )}
      </View>
    </CosmicScreen>
  );
}

function SetupAction({
  index,
  title,
  detail,
  onPress,
}: {
  index: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.setupAction, pressed && styles.pressed]}
    >
      <Text style={styles.setupIndex}>{index}</Text>
      <View style={styles.setupCopy}>
        <Text style={styles.setupTitle}>{title}</Text>
        <Text style={styles.setupDetail}>{detail}</Text>
      </View>
      <Text style={styles.setupArrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  immersiveContent: { paddingHorizontal: 0, paddingBottom: 0 },
  sheet: {
    minHeight: 360,
    marginTop: -24,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.huge,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: brand.card,
    borderTopWidth: 1,
    borderColor: brand.line,
  },
  sheetLabel: {
    ...type.eyebrow,
    color: brand.rose,
    fontSize: 8.5,
    letterSpacing: 1.25,
  },
  sheetTitle: {
    ...type.display,
    color: brand.ink,
    fontSize: 30,
    lineHeight: 36,
    marginTop: space.sm,
  },
  sheetBody: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.sm,
    maxWidth: 390,
  },
  setupAction: {
    minHeight: 82,
    marginTop: space.lg,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setupIndex: {
    ...type.eyebrow,
    width: 34,
    color: brand.rose,
    fontSize: 9,
    letterSpacing: 1,
  },
  setupCopy: { flex: 1 },
  setupTitle: { ...type.bodyStrong, color: brand.ink, fontSize: 14.5 },
  setupDetail: { ...type.bodySmall, color: brand.inkLow, marginTop: 2 },
  setupArrow: { color: brand.gold, fontSize: 19 },
  inputShell: {
    minHeight: 214,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(228,175,197,0.38)',
    backgroundColor: brand.void,
  },
  input: {
    minHeight: 158,
    ...type.body,
    color: brand.ink,
    fontSize: 16,
    lineHeight: 25,
  },
  counter: {
    ...type.bodySmall,
    color: brand.inkLow,
    textAlign: 'right',
    marginTop: space.sm,
  },
  privacyRow: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: space.sm,
    backgroundColor: brand.gold,
  },
  privacy: { ...type.bodySmall, flex: 1, color: brand.inkLow },
  supportLink: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  revealCta: {
    marginBottom: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.rose,
    backgroundColor: brand.surface,
  },
  revealKicker: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.8, fontSize: 10 },
  revealTitle: { ...type.displayItalic, color: brand.ink, fontSize: 20, lineHeight: 26, marginTop: space.xs },
  revealBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm, lineHeight: 19 },
  revealArrow: { ...type.bodyStrong, color: brand.rose, marginTop: space.md, fontSize: 14 },
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
  milestone: {
    marginTop: space.xl,
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: brand.line,
    alignItems: 'center',
  },
  milestoneKicker: { ...type.eyebrow, color: brand.gold, letterSpacing: 1.8, fontSize: 10 },
  milestoneTitle: {
    ...type.displayItalic,
    color: brand.ink,
    fontSize: 22,
    lineHeight: 28,
    marginTop: space.sm,
    textAlign: 'center',
  },
  milestoneBody: {
    ...type.bodySmall,
    color: brand.inkMid,
    marginTop: space.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  readPartner: {
    alignSelf: 'center',
    marginTop: space.lg,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  readPartnerLabel: { ...type.bodyStrong, color: brand.rose },
  supportLabel: { ...type.bodySmall, color: brand.inkMid, textDecorationLine: 'underline' },
  error: { ...type.bodySmall, color: brand.rose, marginTop: space.md },
  primary: {
    minHeight: 58,
    marginTop: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: { opacity: 0.35 },
  primaryText: { ...type.bodyStrong, color: brand.void, fontSize: 15 },
  primaryArrow: { color: brand.void, fontSize: 19, marginLeft: space.sm },
  sealedState: { alignItems: 'flex-start' },
  sealedMark: {
    width: 64,
    height: 64,
    marginBottom: space.lg,
    borderRadius: 32,
    backgroundColor: 'rgba(228,175,197,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(228,175,197,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealedMarkCore: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: brand.gold,
    shadowColor: brand.gold,
    shadowOpacity: 0.82,
    shadowRadius: 12,
  },
  pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
});
