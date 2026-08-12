import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackdrop from '../src/components/app/AppBackdrop';
import AddMoreSheet from '../src/components/home/AddMoreSheet';
import CompletionBanner from '../src/components/home/CompletionBanner';
import CosmicSection from '../src/components/home/CosmicSection';
import DailyFeedSection from '../src/components/home/DailyFeedSection';
import DateStrip from '../src/components/home/DateStrip';
import EducationCard from '../src/components/home/EducationCard';
import ForecastCard from '../src/components/home/ForecastCard';
import InsightCard from '../src/components/home/InsightCard';
import PhaseVisualization from '../src/components/home/PhaseVisualization';
import QuickActionSheet, { type QuickAction } from '../src/components/home/QuickActionSheet';
import RecapCard from '../src/components/home/RecapCard';
import RecommendationCard from '../src/components/home/RecommendationCard';
import SocialForecastCard from '../src/components/home/SocialForecastCard';
import StardustBottomNav from '../src/components/home/StardustBottomNav';
import TagGrid from '../src/components/home/TagGrid';
import { FEELINGS, reflectionFor, type Feeling } from '../src/daily-edition';
import { MORE_TAGS, PRIMARY_TAGS, RECOMMENDATIONS } from '../src/stardust-feed';
import { brand, layout, radius, space, type } from '../src/design';

export default function DailyPreview() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const checkInY = useRef(0);
  const journeyY = useRef(0);
  const writingY = useRef(0);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedNight, setSelectedNight] = useState(4);
  const [lockedNight, setLockedNight] = useState<number | null>(null);
  const [writingOpen, setWritingOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sealed, setSealed] = useState(false);
  const [completionVisible, setCompletionVisible] = useState(false);

  if (!__DEV__) return <Redirect href="/sign-in" />;

  const currentNight = sealed ? 5 : 4;
  const completed = sealed ? [1, 2, 3, 4] : [1, 2, 3];
  const primaryFeelings = feelings.filter((feeling): feeling is Feeling => (FEELINGS as readonly string[]).includes(feeling));

  function scrollTo(y: number) {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, y - space.lg), animated: true }));
  }

  function toggleFeeling(feeling: string) {
    setFeelings((current) => current.includes(feeling) ? current.filter((item) => item !== feeling) : [...current, feeling]);
  }

  function handleAction(action: QuickAction | 'write' | 'check-in' | 'journey') {
    setActionsOpen(false);
    if (action === 'check-in') return scrollTo(checkInY.current);
    if (action === 'journey') return scrollTo(journeyY.current);
    setWritingOpen(true);
    scrollTo(writingY.current);
  }

  function sealPreview() {
    if (!draft.trim()) return;
    setSealed(true);
    setSelectedNight(5);
    setWritingOpen(false);
    setDraft('');
    setCompletionVisible(true);
    scrollTo(0);
  }

  return (
    <View style={styles.root}>
      <AppBackdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View><Text style={styles.kicker}>INTERACTION PREVIEW</Text><Text style={styles.title}>today’s edition.</Text></View>
            <Pressable onPress={() => router.replace('/sign-in')} accessibilityRole="button" accessibilityLabel="Exit interaction preview" style={({ pressed }) => [styles.exit, pressed && styles.pressed]}><Text style={styles.exitText}>Exit</Text></Pressable>
          </View>

          <View style={styles.notice} accessibilityRole="summary"><Text style={styles.noticeTitle}>Sample state · nothing is saved</Text><Text style={styles.noticeBody}>No real partner, account, note, or match is represented here.</Text></View>
          <CompletionBanner night={4} visible={completionVisible} onFinished={() => setCompletionVisible(false)} />

          <View style={styles.dateBlock} onLayout={(event) => { journeyY.current = event.nativeEvent.layout.y; }}>
            <Text style={styles.kicker}>YOUR NIGHTLY RHYTHM</Text>
            <Text style={styles.dateTitle}>Night {String(selectedNight).padStart(2, '0')}</Text>
            <DateStrip currentNight={currentNight} selectedNight={selectedNight} completedNights={completed} onSelect={(night, locked) => { if (locked) return setLockedNight(night); setLockedNight(null); setSelectedNight(night); }} />
            {lockedNight ? <Text style={styles.locked} accessibilityLiveRegion="polite">Night {lockedNight} opens when it arrives.</Text> : null}
          </View>

          <ForecastCard night={currentNight} prompt={sealed ? 'What deserves your attention tomorrow?' : 'What feels true tonight?'} status={sealed ? 'SEALED' : 'OPEN'} onPress={() => handleAction('write')} />

          <DailyFeedSection eyebrow="FOR YOUR EVENING" title="A few ways in">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendations}>
              {RECOMMENDATIONS.map((item) => <RecommendationCard key={item.id} item={item} onPress={() => handleAction(item.action)} />)}
            </ScrollView>
          </DailyFeedSection>

          <View onLayout={(event) => { checkInY.current = event.nativeEvent.layout.y; }}>
            <DailyFeedSection eyebrow="CHECK IN" title="What is present?" actionLabel="Clear" onAction={() => setFeelings([])}>
              <TagGrid tags={PRIMARY_TAGS} selected={feelings} onToggle={toggleFeeling} onAddMore={() => setMoreOpen(true)} />
            </DailyFeedSection>
          </View>

          <DailyFeedSection eyebrow="REFLECTION" title="A small editorial note" actionLabel="Act" onAction={() => setActionsOpen(true)}><InsightCard text={reflectionFor(primaryFeelings)} active={feelings.length > 0} /></DailyFeedSection>
          <DailyFeedSection eyebrow="CONNECTION" title="The social weather"><SocialForecastCard hasMatch={false} partnerPresent={false} onPrimary={() => setActionsOpen(true)} onSecondary={() => setActionsOpen(true)} /></DailyFeedSection>
          <DailyFeedSection eyebrow="YOUR PHASE" title="The shape of the 21 nights"><PhaseVisualization night={currentNight} completed={completed.length} onPress={() => scrollTo(journeyY.current)} /></DailyFeedSection>
          <DailyFeedSection eyebrow="COSMIC" title="A wider view"><CosmicSection onPress={() => setActionsOpen(true)} /></DailyFeedSection>
          <DailyFeedSection eyebrow="RECAP" title="What has accumulated"><RecapCard completed={completed.length} streak={3} onPress={() => scrollTo(journeyY.current)} /></DailyFeedSection>
          <DailyFeedSection eyebrow="THE RITUAL" title="A boundary, not a score"><EducationCard onPress={() => setActionsOpen(true)} /></DailyFeedSection>

          <View style={styles.writingAnchor} onLayout={(event) => { writingY.current = event.nativeEvent.layout.y; }}>
            {writingOpen && !sealed ? <View style={styles.writer}><Text style={styles.kicker}>PRIVATE SAMPLE RESPONSE</Text><Text style={styles.sectionTitle}>write before you polish it.</Text><TextInput value={draft} onChangeText={setDraft} placeholder="Try one small sentence…" placeholderTextColor={brand.inkLow} accessibilityLabel="Sample private response" multiline style={styles.input} /><Pressable onPress={sealPreview} disabled={!draft.trim()} accessibilityRole="button" accessibilityLabel="Seal preview response" accessibilityState={{ disabled: !draft.trim() }} style={({ pressed }) => [styles.seal, !draft.trim() && styles.disabled, pressed && styles.pressed]}><Text style={styles.sealText}>Seal preview</Text></Pressable></View> : null}
          </View>
          <Text style={styles.footer}>Development preview only · refresh to reset</Text>
        </ScrollView>
      </SafeAreaView>

      <StardustBottomNav onPress={() => setActionsOpen(true)} />
      <AddMoreSheet visible={moreOpen} tags={MORE_TAGS} selected={feelings} onToggle={toggleFeeling} onClose={() => setMoreOpen(false)} />
      <QuickActionSheet visible={actionsOpen} onClose={() => setActionsOpen(false)} onAction={handleAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void }, safe: { flex: 1 }, content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: space.lg, paddingBottom: space.huge + 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, kicker: { ...type.eyebrow, color: brand.rose, fontSize: 8, letterSpacing: 1.2 }, title: { ...type.displayItalic, color: brand.ink, fontSize: 38, lineHeight: 43, marginTop: 2 },
  exit: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: brand.line }, exitText: { ...type.bodyStrong, color: brand.inkMid },
  notice: { marginTop: space.lg, padding: space.md, borderRadius: radius.md, backgroundColor: 'rgba(236,200,133,0.08)', borderWidth: 1, borderColor: 'rgba(236,200,133,0.28)' }, noticeTitle: { ...type.bodyStrong, color: brand.gold }, noticeBody: { ...type.bodySmall, color: brand.inkMid, marginTop: 2 },
  dateBlock: { marginTop: space.xl }, dateTitle: { ...type.displayItalic, color: brand.ink, fontSize: 32, lineHeight: 38, marginTop: 2, marginBottom: space.lg }, locked: { ...type.bodySmall, color: brand.gold, marginTop: space.sm }, recommendations: { gap: space.md, paddingTop: space.lg, paddingRight: space.xl },
  writingAnchor: { marginTop: space.xl }, writer: { padding: space.lg, borderRadius: radius.lg, backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line }, sectionTitle: { ...type.displayItalic, color: brand.ink, fontSize: 27, lineHeight: 34, marginTop: space.xs },
  input: { minHeight: 128, marginTop: space.lg, padding: space.lg, borderRadius: radius.md, backgroundColor: brand.void, borderWidth: 1, borderColor: brand.line, ...type.body, color: brand.ink, textAlignVertical: 'top' }, seal: { minHeight: 52, marginTop: space.md, borderRadius: radius.pill, backgroundColor: brand.rose, alignItems: 'center', justifyContent: 'center' }, sealText: { ...type.bodyStrong, color: brand.void }, disabled: { opacity: 0.35 }, footer: { ...type.bodySmall, color: brand.inkLow, textAlign: 'center', marginTop: space.xxl }, pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});
