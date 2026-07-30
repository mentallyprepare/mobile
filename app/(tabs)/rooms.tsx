import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  type ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
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

export default function Night() {
  const router = useRouter();
  const { data, loading, error: loadError, hasLoaded, reload } = useMeShared();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSealed, setJustSealed] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  // Read before the early returns: hooks cannot live behind a condition, and
  // both values are available as soon as the provider has any data at all.
  const userId = data?.user?.id ?? 0;
  const activeNight = data?.match?.day ?? 0;
  const scope = { userId, night: activeNight };

  // Restore anything left unsealed on this device for this night.
  useEffect(() => {
    let alive = true;
    setDraftRestored(false);
    void drafts.load({ userId, night: activeNight }).then((saved) => {
      if (!alive) return;
      // Never overwrite something already being typed: if the editor has
      // content, whatever is on disk is older than what is on screen.
      if (saved) setDraft((current) => (current.length > 0 ? current : saved));
      setDraftRestored(true);
    });
    return () => {
      alive = false;
    };
  }, [userId, activeNight]);

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
      await sealEntry({ text: draft.trim(), selectedPrompt: prompt });
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
        {sealedTonight ? (
          <View style={styles.sealedState}>
            <View style={styles.sealedMark}>
              <View style={styles.sealedMarkCore} />
            </View>
            <Text style={styles.sheetLabel}>SEALED LOCALLY AND ON YOUR ACCOUNT</Text>
            <Text style={styles.sheetTitle}>Your note became a star.</Text>
            <Text style={styles.sheetBody}>
              Nothing more is required tonight. Another person’s words remain hidden until the
              room’s scheduled reveal.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sheetLabel}>YOUR PRIVATE RESPONSE</Text>
            <Text style={styles.sheetTitle}>Write before you polish it.</Text>
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
            <View style={styles.privacyRow}>
              <View style={styles.privacyDot} />
              <Text style={styles.privacy}>
                Only you can see this before the scheduled reveal.
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
