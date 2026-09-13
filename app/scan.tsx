import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DaylightCard from '../src/components/DaylightCard';
import DaylightButton from '../src/components/DaylightButton';
import Illustration from '../src/components/Illustration';
import CosmicWelcome from '../src/components/CosmicWelcome';
import { daylight, layout, radius, space, type } from '../src/design';
import {
  ARCHETYPES,
  QUESTIONS,
  SCALE_MAX,
  SCALE_MIN,
  scoreQuiz,
  type ArchetypeKey,
} from '../src/quiz';
import { submitScan } from '../src/api/scan';
import { useMeShared } from '../src/api/me-provider';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

type Stage =
  | { kind: 'intro' }
  | { kind: 'question'; index: number }
  | { kind: 'submitting' }
  | { kind: 'result'; archetype: ArchetypeKey }
  | { kind: 'error'; message: string };

/**
 * ECP-11 psychometric scan. Same 11 questions and same scoring as the web
 * (see src/quiz.ts, ported verbatim from public/app.js). Server re-validates.
 */
export default function ScanScreen() {
  useLanguage();
  const router = useRouter();
  const { reload } = useMeShared();
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array(QUESTIONS.length).fill(null),
  );
  const [stage, setStage] = useState<Stage>({ kind: 'intro' });

  function pick(index: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function finalise() {
    setStage({ kind: 'submitting' });
    try {
      const { scores, archetype } = scoreQuiz(answers);
      await submitScan({ scores, archetype, answers: answers as number[] });
      await reload();
      setStage({ kind: 'result', archetype });
    } catch {
      setStage({ kind: 'error', message: t('scan.save_error') });
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {stage.kind === 'intro' ? (
          <IntroBody
            onStart={() => setStage({ kind: 'question', index: 0 })}
            onSkip={() => router.back()}
          />
        ) : stage.kind === 'question' ? (
          <QuestionBody
            index={stage.index}
            answer={answers[stage.index]}
            onPick={(v) => pick(stage.index, v)}
            onBack={() => {
              if (stage.index === 0) setStage({ kind: 'intro' });
              else setStage({ kind: 'question', index: stage.index - 1 });
            }}
            onNext={() => {
              if (stage.index < QUESTIONS.length - 1) {
                setStage({ kind: 'question', index: stage.index + 1 });
              } else {
                void finalise();
              }
            }}
          />
        ) : stage.kind === 'submitting' ? (
          <SubmittingBody />
        ) : stage.kind === 'result' ? (
          <ResultBody
            archetype={stage.archetype}
            onDone={() => router.replace('/you')}
          />
        ) : (
          <ErrorBody
            message={stage.message}
            onRetry={() => void finalise()}
            onBack={() =>
              setStage({ kind: 'question', index: QUESTIONS.length - 1 })
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

// ---------- Bodies ----------

function IntroBody({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.column}>
        <CosmicWelcome />
        <Text style={styles.title}>{t('scan.intro_title')}</Text>
        <Text style={styles.sub}>{t('scan.intro_body')}</Text>
        <DaylightCard style={styles.notesCard} accent="violet">
          <Text style={styles.noteRow}>{t('scan.note_time')}</Text>
          <Text style={styles.noteRow}>{t('scan.note_back')}</Text>
          <Text style={styles.noteRow}>{t('scan.note_private')}</Text>
        </DaylightCard>
        <View style={styles.introActions}>
          <DaylightButton label={t('scan.begin')} onPress={onStart} block />
          <Pressable
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={t('scan.not_now_a11y')}
            style={styles.skipBtn}
          >
            <Text style={styles.skipLabel}>{t('scan.not_now')}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function QuestionBody({
  index,
  answer,
  onPick,
  onBack,
  onNext,
}: {
  index: number;
  answer: number | null;
  onPick: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const q = QUESTIONS[index];
  const canAdvance = answer !== null;
  const isLast = index === QUESTIONS.length - 1;
  const answered = index; // count of answered before this one, or below on skip-back

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.column}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('scan.back_a11y')}
          style={styles.backBtn}
        >
          <Text style={styles.backLabel}>{t('scan.back')}</Text>
        </Pressable>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((index) / QUESTIONS.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {answered} / {QUESTIONS.length}{t('scan.answered_suffix')}
          </Text>
        </View>

        <Text style={styles.eyebrow}>{t(`scan.q${q.id}_category`).toUpperCase()}</Text>
        <Text style={styles.question}>{t(`scan.q${q.id}_text`)}</Text>

        <View style={styles.scale}>
          <Text style={styles.scaleEnd}>{t('scan.scale_low')}</Text>
          <View style={styles.dots}>
            {Array.from({ length: SCALE_MAX }, (_, i) => i + SCALE_MIN).map((v) => {
              const active = answer === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => onPick(v)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={t(`scan.scale_${v}`)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.dot,
                    active && styles.dotOn,
                    pressed && styles.dotPressed,
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.scaleEnd}>{t('scan.scale_high')}</Text>
        </View>

        <Text style={styles.currentAnswer}>
          {answer !== null ? t(`scan.scale_${answer}`) : t('scan.tap_answer')}
        </Text>

        <View style={styles.qActions}>
          <DaylightButton
            label={isLast ? t('scan.see_archetype') : t('scan.continue')}
            onPress={onNext}
            disabled={!canAdvance}
            block
          />
        </View>
      </View>
    </ScrollView>
  );
}

function SubmittingBody() {
  return (
    <View style={styles.centered}>
      <Illustration slot="home-hero" size={80} />
      <Text style={styles.title}>{t('scan.reading')}</Text>
    </View>
  );
}

function ResultBody({
  archetype,
  onDone,
}: {
  archetype: ArchetypeKey;
  onDone: () => void;
}) {
  const a = ARCHETYPES[archetype];
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.column}>
        <Text style={styles.moon}>{a.moon}</Text>
        <Text style={styles.archName}>{t(`scan.${archetype}_name`)}</Text>
        <Text style={styles.quote}>{t(`scan.${archetype}_quote`)}</Text>

        <DaylightCard style={styles.notesCard}>
          <Text style={styles.archBody}>{t(`scan.${archetype}_description`)}</Text>
        </DaylightCard>

        <Text style={styles.section}>{t('scan.strengths')}</Text>
        {a.strengths.map((_, index) => (
          <Text key={index} style={styles.bullet}>· {t(`scan.${archetype}_strength_${index + 1}`)}</Text>
        ))}

        <Text style={styles.section}>{t('scan.growth')}</Text>
        {a.growth.map((_, index) => (
          <Text key={index} style={styles.bullet}>· {t(`scan.${archetype}_growth_${index + 1}`)}</Text>
        ))}

        <View style={styles.qActions}>
          <DaylightButton label={t('scan.continue')} onPress={onDone} block />
        </View>
      </View>
    </ScrollView>
  );
}

function ErrorBody({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>{t('scan.save_failed')}</Text>
      <Text style={styles.errorText}>{message}</Text>
      <View style={styles.qActions}>
        <DaylightButton label={t('scan.try_again')} onPress={onRetry} block />
        <Pressable onPress={onBack} style={styles.skipBtn} accessibilityRole="button">
          <Text style={styles.skipLabel}>{t('scan.last_question')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: daylight.bg },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingVertical: space.xl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.gutter,
    gap: space.md,
  },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },

  title: {
    marginTop: space.xl,
    ...type.displayItalic,
    fontSize: 38,
    lineHeight: 44,
    color: daylight.ink,
  },
  sub: { marginTop: space.md, ...type.body, color: daylight.inkMid },

  notesCard: { marginTop: space.xl, padding: space.xl },
  noteRow: { ...type.body, color: daylight.ink, marginBottom: 6 },
  archBody: { ...type.body, color: daylight.ink, lineHeight: 23 },

  introActions: { marginTop: space.xl, gap: space.md },
  skipBtn: { alignSelf: 'center', paddingVertical: 6 },
  skipLabel: { ...type.body, fontSize: 13, color: daylight.inkMid },

  backBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  backLabel: { ...type.body, fontSize: 13.5, color: daylight.inkMid },

  progressRow: { marginTop: space.md },
  progressTrack: {
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: daylight.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: daylight.accent,
    borderRadius: radius.pill,
  },
  progressLabel: {
    marginTop: space.sm,
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 0.8,
    color: daylight.inkLow,
    textTransform: 'lowercase',
  },

  eyebrow: {
    marginTop: space.xl,
    ...type.eyebrow,
    color: daylight.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  question: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 26,
    lineHeight: 34,
    color: daylight.ink,
  },

  scale: { marginTop: space.xl, alignItems: 'center', gap: space.md },
  scaleEnd: {
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 0.8,
    color: daylight.inkLow,
    textTransform: 'lowercase',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
  },
  dotOn: {
    backgroundColor: daylight.accent,
    borderColor: daylight.accent,
  },
  dotPressed: { opacity: 0.7 },
  currentAnswer: {
    marginTop: space.lg,
    textAlign: 'center',
    ...type.body,
    fontSize: 14,
    color: daylight.accent,
    fontStyle: 'italic',
  },

  qActions: { marginTop: space.xl, gap: space.md },

  moon: { fontSize: 44, textAlign: 'center', marginTop: space.xl },
  archName: {
    marginTop: space.md,
    textAlign: 'center',
    ...type.displayItalic,
    fontSize: 32,
    lineHeight: 38,
    color: daylight.ink,
  },
  quote: {
    marginTop: space.sm,
    textAlign: 'center',
    ...type.body,
    fontStyle: 'italic',
    color: daylight.inkMid,
  },
  section: {
    marginTop: space.xl,
    marginBottom: space.sm,
    ...type.eyebrow,
    color: daylight.inkMid,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  bullet: { ...type.body, color: daylight.ink, marginBottom: 4 },

  errorText: { ...type.body, color: daylight.inkMid, textAlign: 'center' },
});
