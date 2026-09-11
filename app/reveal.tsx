import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useMeShared } from '../src/api/me-provider';
import {
  REVEAL_CHOICES,
  submitRevealChoice,
} from '../src/api/reveal';
import { ApiError } from '../src/api';
import type { RevealChoice, RevealState, RevealedPartner } from '../src/api/reveal';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';
import { brand, radius, space, type } from '../src/design';

/**
 * Localised label lookup for each RevealChoice. Reads from t() so the choice
 * text follows the picker's language. Kept as a function (not a memoised
 * table) so a language change re-renders correctly — useLanguage() up in
 * the component causes a re-render, this helper then returns fresh strings.
 */
function choiceLabels(choice: RevealChoice): { short: string; long: string } {
  return {
    short: t(`reveal.choice_${choice}_short`),
    long: t(`reveal.choice_${choice}_long`),
  };
}

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
  // Subscribe to language changes so a picker choice re-renders the reveal
  // copy immediately, not on next mount.
  useLanguage();
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
            accessibilityLabel={t('reveal.back_a11y')}
            hitSlop={12}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backLabel}>← {t('reveal.back_a11y').toLowerCase()}</Text>
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
      <Text style={styles.kicker}>{t('reveal.kicker')}</Text>
      <Text style={styles.title}>{t('reveal.not_yet_title')}</Text>
      <Text style={styles.body}>{t('reveal.not_yet_body')}</Text>
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
      <Text style={styles.kicker}>{t('reveal.kicker')}</Text>
      <Text style={styles.title}>{t('reveal.choose_title')}</Text>
      <Text style={styles.body}>{t('reveal.choose_body')}</Text>

      <View style={styles.choices}>
        {REVEAL_CHOICES.map((choice) => {
          const isBusy = submitting === choice;
          const anyBusy = submitting !== null;
          const labels = choiceLabels(choice);
          return (
            <Pressable
              key={choice}
              onPress={() => onChoose(choice)}
              disabled={anyBusy}
              accessibilityRole="button"
              accessibilityLabel={labels.short}
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
                {labels.short}
              </Text>
              <Text style={styles.choiceLong}>{labels.long}</Text>
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
        <Text style={styles.kicker}>{t('reveal.kicker')}</Text>
        <Text style={styles.title}>
          {t('reveal.waiting_title_prefix')}
          {choiceLabels(myChoice).short}
          {t('reveal.waiting_title_suffix')}
        </Text>
        <Text style={styles.body}>{t('reveal.waiting_body')}</Text>
        <Text style={styles.locked}>{t('reveal.waiting_locked')}</Text>
      </View>
    );
  }

  // Both chose stay_anonymous branch.
  if (reveal.anonymous) {
    return (
      <View>
        <Text style={styles.kicker}>{t('reveal.kicker')}</Text>
        <Text style={styles.title}>{t('reveal.anonymous_title')}</Text>
        <Text style={styles.body}>{t('reveal.anonymous_body')}</Text>
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
        <Text style={styles.kicker}>{t('reveal.kicker')}</Text>
        <Text style={styles.title}>{t('reveal.revealed_title')}</Text>
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
      <Text style={styles.kicker}>{t('reveal.kicker')}</Text>
      <Text style={styles.title}>{t('reveal.settling_title')}</Text>
      <Text style={styles.body}>{t('reveal.settling_body')}</Text>
    </View>
  );
}

function PartnerCard({ partner }: { partner: RevealedPartner }) {
  return (
    <View style={styles.partnerCard}>
      <Text style={styles.partnerLabel}>{t('reveal.partner_card_label')}</Text>
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
          accessibilityLabel={`${t('reveal.partner_email_a11y_prefix')}${partner.email}`}
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
      <Text style={styles.letterLabel}>{t('reveal.unsent_letter_label')}</Text>
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
