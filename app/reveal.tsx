import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useMeShared } from '../src/api/me-provider';
import {
  REVEAL_CHOICES,
  REVEAL_LABELS,
  submitRevealChoice,
} from '../src/api/reveal';
import { ApiError } from '../src/api';
import type { RevealChoice, RevealState, RevealedPartner } from '../src/api/reveal';
import { brand, radius, space, type } from '../src/design';

/**
 * Day 21 reveal — the product's climax.
 *
 * Four states, driven by the reveal object on /api/me:
 *  1. Not available yet (Day < 21 or no match). Screen shouldn't be reached;
 *     it renders a soft placeholder if it somehow is.
 *  2. Available, myChoice null → the four-choice screen.
 *  3. Available, myChoice set, partnerChose false → "you chose … waiting."
 *  4. Available, both chose:
 *     - anonymous branch: neither identity crosses, but the Day-11 letter does.
 *     - revealed branch: partner identity per their chosen level, plus letter.
 *
 * The choice locks after submission. The server enforces this; the client
 * never offers to change once myChoice is set.
 */
export default function RevealScreen() {
  const router = useRouter();
  const { data, reload } = useMeShared();
  const [submitting, setSubmitting] = useState<RevealChoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reveal = data?.reveal ?? null;

  async function choose(choice: RevealChoice) {
    if (submitting) return;
    setSubmitting(choice);
    setError(null);
    try {
      await submitRevealChoice(choice);
      await reload();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Already locked — reload to show the current state.
        await reload();
      } else {
        setError(messageFor(err));
      }
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Day 21' }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
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
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {!reveal ? (
            <NotYet />
          ) : reveal.myChoice === null ? (
            <ChoosePanel
              onChoose={(c) => void choose(c)}
              submitting={submitting}
              error={error}
            />
          ) : (
            <AfterChoice reveal={reveal} />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ---------- panels ------------------------------------------------------

function NotYet() {
  return (
    <View style={styles.panel}>
      <Text style={styles.kicker}>DAY 21</Text>
      <Text style={styles.title}>Reveal opens on the twenty-first night.</Text>
      <Text style={styles.body}>
        Come back after tonight&apos;s note is sealed on Night 21. Until then,
        the choice hasn&apos;t appeared yet.
      </Text>
    </View>
  );
}

function ChoosePanel({
  onChoose,
  submitting,
  error,
}: {
  onChoose: (c: RevealChoice) => void;
  submitting: RevealChoice | null;
  error: string | null;
}) {
  return (
    <View>
      <Text style={styles.kicker}>DAY 21</Text>
      <Text style={styles.title}>Choose what you want to share.</Text>
      <Text style={styles.body}>
        Both of you choose separately. If either one of you stays anonymous,
        neither identity crosses. Your choice locks after you submit.
      </Text>

      <View style={styles.choices}>
        {REVEAL_CHOICES.map((choice) => {
          const isBusy = submitting === choice;
          const anyBusy = submitting !== null;
          return (
            <Pressable
              key={choice}
              onPress={() => onChoose(choice)}
              disabled={anyBusy}
              accessibilityRole="button"
              accessibilityLabel={REVEAL_LABELS[choice].short}
              accessibilityState={{ disabled: anyBusy }}
              style={({ pressed }) => [
                styles.choice,
                choice === 'stay_anonymous' && styles.choiceMuted,
                anyBusy && styles.choiceDim,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.choiceShort,
                  choice === 'stay_anonymous' && styles.choiceShortMuted,
                ]}
              >
                {REVEAL_LABELS[choice].short}
              </Text>
              <Text style={styles.choiceLong}>{REVEAL_LABELS[choice].long}</Text>
              {isBusy ? <ActivityIndicator color={brand.rose} style={styles.spinner} /> : null}
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function AfterChoice({ reveal }: { reveal: RevealState }) {
  const myChoice = reveal.myChoice;
  if (!myChoice) return null;

  // Waiting: we chose, partner hasn't.
  if (!reveal.partnerChose) {
    return (
      <View>
        <Text style={styles.kicker}>DAY 21</Text>
        <Text style={styles.title}>You chose {REVEAL_LABELS[myChoice].short}.</Text>
        <Text style={styles.body}>
          Waiting for the other person to make their choice. When they do,
          this screen updates on its own — or on your next visit.
        </Text>
        <Text style={styles.locked}>your choice is locked.</Text>
      </View>
    );
  }

  // Both chose stay_anonymous branch.
  if (reveal.anonymous) {
    return (
      <View>
        <Text style={styles.kicker}>DAY 21</Text>
        <Text style={styles.title}>This partnership stays private.</Text>
        <Text style={styles.body}>
          One of you chose to stay anonymous. Neither identity crosses.
          The twenty-one nights stay yours.
        </Text>
        {reveal.partnerUnsentLetter ? (
          <UnsentLetter text={reveal.partnerUnsentLetter} />
        ) : null}
      </View>
    );
  }

  // Both chose to reveal at some level.
  if (reveal.revealed && reveal.partner) {
    return (
      <View>
        <Text style={styles.kicker}>DAY 21</Text>
        <Text style={styles.title}>Say hi.</Text>
        <PartnerCard partner={reveal.partner} />
        {reveal.partnerUnsentLetter ? (
          <UnsentLetter text={reveal.partnerUnsentLetter} />
        ) : null}
      </View>
    );
  }

  // Fallback — partner chose but we don't have identity data yet. Rare
  // (usually a stale /api/me between the two writes); reload will fix it.
  return (
    <View>
      <Text style={styles.kicker}>DAY 21</Text>
      <Text style={styles.title}>Both of you have chosen.</Text>
      <Text style={styles.body}>
        The reveal is settling. This screen will update on your next visit.
      </Text>
    </View>
  );
}

function PartnerCard({ partner }: { partner: RevealedPartner }) {
  return (
    <View style={styles.partnerCard}>
      <Text style={styles.partnerLabel}>YOUR PARTNER WAS</Text>
      <Text style={styles.partnerName}>{partner.fullName ?? partner.name}</Text>
      {partner.college ? (
        <Text style={styles.partnerDetail}>
          {partner.college}
          {partner.year ? ` · ${partner.year}` : ''}
        </Text>
      ) : null}
      {partner.email ? (
        <Text
          style={styles.partnerEmail}
          accessibilityLabel={`Contact email ${partner.email}`}
          selectable
        >
          {partner.email}
        </Text>
      ) : null}
    </View>
  );
}

function UnsentLetter({ text }: { text: string }) {
  return (
    <View style={styles.letter}>
      <Text style={styles.letterLabel}>THE UNSENT LETTER</Text>
      <Text style={styles.letterText}>{text}</Text>
    </View>
  );
}

// ---------- helpers ------------------------------------------------------

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
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
  },
  back: { minHeight: 44, justifyContent: 'center' },
  backLabel: { ...type.body, color: brand.inkMid },
  scroll: { padding: space.lg, paddingBottom: space.huge },
  panel: { paddingTop: space.xl },
  kicker: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.6, fontSize: 11 },
  title: {
    ...type.displayItalic,
    color: brand.ink,
    fontSize: 28,
    lineHeight: 34,
    marginTop: space.sm,
  },
  body: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.md,
    lineHeight: 22,
  },
  choices: { marginTop: space.xl, gap: space.md },
  choice: {
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.rose,
    backgroundColor: brand.card,
  },
  choiceMuted: { borderColor: brand.line },
  choiceDim: { opacity: 0.55 },
  choiceShort: { ...type.bodyStrong, color: brand.rose, fontSize: 16 },
  choiceShortMuted: { color: brand.inkMid },
  choiceLong: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs, lineHeight: 19 },
  spinner: { marginTop: space.sm, alignSelf: 'flex-start' },
  error: { ...type.bodySmall, color: brand.danger, marginTop: space.md, textAlign: 'center' },
  locked: {
    ...type.eyebrow,
    color: brand.inkMid,
    letterSpacing: 1.6,
    fontSize: 10,
    marginTop: space.xl,
    textAlign: 'center',
  },
  partnerCard: {
    marginTop: space.xl,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.rose,
    backgroundColor: brand.card,
    alignItems: 'center',
  },
  partnerLabel: {
    ...type.eyebrow,
    color: brand.rose,
    letterSpacing: 1.8,
    fontSize: 10,
  },
  partnerName: {
    ...type.displayItalic,
    color: brand.ink,
    fontSize: 32,
    lineHeight: 40,
    marginTop: space.sm,
    textAlign: 'center',
  },
  partnerDetail: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.sm,
    textAlign: 'center',
  },
  partnerEmail: {
    ...type.bodyStrong,
    color: brand.rose,
    marginTop: space.md,
    textAlign: 'center',
  },
  letter: {
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
  },
  letterLabel: {
    ...type.eyebrow,
    color: brand.inkMid,
    letterSpacing: 1.6,
    fontSize: 10,
    marginBottom: space.md,
  },
  letterText: {
    ...type.body,
    color: brand.ink,
    lineHeight: 24,
  },
  pressed: { opacity: 0.78 },
});
