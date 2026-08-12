import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackdrop from '../src/components/app/AppBackdrop';
import MoodChip from '../src/components/home/MoodChip';
import NightProgressStrip from '../src/components/home/NightProgressStrip';
import InsightCard from '../src/components/home/InsightCard';
import QuickActionSheet, { type QuickAction } from '../src/components/home/QuickActionSheet';
import CompletionBanner from '../src/components/home/CompletionBanner';
import { FEELINGS, reflectionFor, type Feeling } from '../src/daily-edition';
import { brand, layout, radius, space, type } from '../src/design';

export default function DailyPreview() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const checkInY = useRef(0);
  const journeyY = useRef(0);
  const writingY = useRef(0);
  const [feelings, setFeelings] = useState<Feeling[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lockedNight, setLockedNight] = useState<number | null>(null);
  const [writingOpen, setWritingOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sealed, setSealed] = useState(false);
  const [completionVisible, setCompletionVisible] = useState(false);

  if (!__DEV__) return <Redirect href="/sign-in" />;

  const currentNight = sealed ? 5 : 4;
  const completed = sealed ? [1, 2, 3, 4] : [1, 2, 3];

  function scrollTo(y: number) {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, y - space.lg), animated: true }));
  }

  function toggleFeeling(feeling: Feeling) {
    setFeelings((current) =>
      current.includes(feeling)
        ? current.filter((item) => item !== feeling)
        : [...current, feeling],
    );
  }

  function handleAction(action: QuickAction) {
    setSheetOpen(false);
    if (action === 'check-in') return scrollTo(checkInY.current);
    if (action === 'journey') return scrollTo(journeyY.current);
    setWritingOpen(true);
    scrollTo(writingY.current);
  }

  function sealPreview() {
    if (!draft.trim()) return;
    setSealed(true);
    setWritingOpen(false);
    setDraft('');
    setCompletionVisible(true);
    scrollTo(0);
  }

  return (
    <View style={styles.root}>
      <AppBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>INTERACTION PREVIEW</Text>
              <Text style={styles.title}>today’s edition.</Text>
            </View>
            <Pressable
              onPress={() => router.replace('/sign-in')}
              accessibilityRole="button"
              accessibilityLabel="Exit interaction preview"
              style={({ pressed }) => [styles.exit, pressed && styles.pressed]}
            >
              <Text style={styles.exitText}>Exit</Text>
            </Pressable>
          </View>

          <View style={styles.notice} accessibilityRole="summary">
            <Text style={styles.noticeTitle}>Sample state · nothing is saved</Text>
            <Text style={styles.noticeBody}>No real partner, account, note, or match is represented here.</Text>
          </View>

          <CompletionBanner
            night={4}
            visible={completionVisible}
            onFinished={() => setCompletionVisible(false)}
          />

          <View onLayout={(event) => { journeyY.current = event.nativeEvent.layout.y; }}>
            <NightProgressStrip
              currentNight={currentNight}
              completedNights={completed}
              onSelectNight={(night) => {
                setLockedNight(null);
                if (night === currentNight) scrollTo(writingY.current);
              }}
              onLockedPress={setLockedNight}
            />
          </View>
          {lockedNight ? (
            <Text style={styles.locked} accessibilityLiveRegion="polite">
              night {lockedNight} opens when it arrives.
            </Text>
          ) : null}

          <Pressable
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open quick actions"
            style={({ pressed }) => [styles.tonight, pressed && styles.pressed]}
          >
            <Text style={styles.kicker}>NIGHT {String(currentNight).padStart(2, '0')} OF 21</Text>
            <Text style={styles.cardTitle}>{sealed ? 'the next night is waiting.' : 'what feels true tonight?'}</Text>
            <Text style={styles.cardBody}>{sealed ? 'The preview progression updated immediately.' : 'Tap to open quick actions.'}</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>

          <View style={styles.section} onLayout={(event) => { checkInY.current = event.nativeEvent.layout.y; }}>
            <Text style={styles.kicker}>HOW IS TONIGHT ARRIVING?</Text>
            <Text style={styles.sectionTitle}>choose what feels nearest.</Text>
            <View style={styles.chips}>
              {FEELINGS.map((feeling) => (
                <MoodChip
                  key={feeling}
                  label={feeling}
                  selected={feelings.includes(feeling)}
                  onPress={() => toggleFeeling(feeling)}
                />
              ))}
            </View>
            <Pressable
              onPress={() => setSheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Add more quick actions"
              style={({ pressed }) => [styles.addMore, pressed && styles.pressed]}
            >
              <Text style={styles.addMoreText}>Add more</Text>
              <Text style={styles.addMoreIcon}>+</Text>
            </Pressable>
          </View>

          <InsightCard text={reflectionFor(feelings)} active={feelings.length > 0} />

          <View style={styles.writingAnchor} onLayout={(event) => { writingY.current = event.nativeEvent.layout.y; }}>
            {writingOpen && !sealed ? (
              <View style={styles.writer}>
                <Text style={styles.kicker}>PRIVATE SAMPLE RESPONSE</Text>
                <Text style={styles.sectionTitle}>write before you polish it.</Text>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Try one small sentence…"
                  placeholderTextColor={brand.inkLow}
                  accessibilityLabel="Sample private response"
                  multiline
                  style={styles.input}
                />
                <Pressable
                  onPress={sealPreview}
                  disabled={!draft.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Seal preview response"
                  accessibilityState={{ disabled: !draft.trim() }}
                  style={({ pressed }) => [styles.seal, !draft.trim() && styles.disabled, pressed && styles.pressed]}
                >
                  <Text style={styles.sealText}>Seal preview</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <Text style={styles.footer}>Development preview only · refresh to reset</Text>
        </ScrollView>
      </SafeAreaView>

      <QuickActionSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onAction={handleAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: space.lg, paddingBottom: space.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { ...type.eyebrow, color: brand.rose, fontSize: 8, letterSpacing: 1.2 },
  title: { ...type.displayItalic, color: brand.ink, fontSize: 38, lineHeight: 43, marginTop: 2 },
  exit: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: brand.line },
  exitText: { ...type.bodyStrong, color: brand.inkMid },
  notice: { marginTop: space.lg, padding: space.md, borderRadius: radius.md, backgroundColor: 'rgba(236,200,133,0.08)', borderWidth: 1, borderColor: 'rgba(236,200,133,0.28)' },
  noticeTitle: { ...type.bodyStrong, color: brand.gold },
  noticeBody: { ...type.bodySmall, color: brand.inkMid, marginTop: 2 },
  locked: { ...type.bodySmall, color: brand.gold, marginTop: space.sm },
  tonight: { marginTop: space.xl, padding: space.xl, minHeight: 180, borderRadius: radius.lg, backgroundColor: brand.card, borderWidth: 1, borderColor: 'rgba(235,180,194,0.32)' },
  cardTitle: { ...type.displayItalic, color: brand.ink, fontSize: 30, lineHeight: 36, marginTop: space.sm, maxWidth: 300 },
  cardBody: { ...type.body, color: brand.inkMid, marginTop: space.sm },
  arrow: { position: 'absolute', right: space.xl, bottom: space.xl, color: brand.gold, fontSize: 24 },
  section: { marginTop: space.xxl },
  sectionTitle: { ...type.displayItalic, color: brand.ink, fontSize: 27, lineHeight: 34, marginTop: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
  addMore: { minHeight: 48, marginTop: space.md, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1, borderColor: brand.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addMoreText: { ...type.bodyStrong, color: brand.ink },
  addMoreIcon: { color: brand.gold, fontSize: 20 },
  writingAnchor: { marginTop: space.lg },
  writer: { padding: space.lg, borderRadius: radius.lg, backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line },
  input: { minHeight: 128, marginTop: space.lg, padding: space.lg, borderRadius: radius.md, backgroundColor: brand.void, borderWidth: 1, borderColor: brand.line, ...type.body, color: brand.ink, textAlignVertical: 'top' },
  seal: { minHeight: 52, marginTop: space.md, borderRadius: radius.pill, backgroundColor: brand.rose, alignItems: 'center', justifyContent: 'center' },
  sealText: { ...type.bodyStrong, color: brand.void },
  disabled: { opacity: 0.35 },
  footer: { ...type.bodySmall, color: brand.inkLow, textAlign: 'center', marginTop: space.xxl },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});
