import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, type ScrollView as ScrollViewType, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import ShelfStrip from '../../src/components/shelf/ShelfStrip';
import DateStrip from '../../src/components/home/DateStrip';
import ForecastCard from '../../src/components/home/ForecastCard';
import RecommendationCard from '../../src/components/home/RecommendationCard';
import DailyFeedSection from '../../src/components/home/DailyFeedSection';
import TagGrid from '../../src/components/home/TagGrid';
import AddMoreSheet from '../../src/components/home/AddMoreSheet';
import SocialForecastCard from '../../src/components/home/SocialForecastCard';
import PhaseVisualization from '../../src/components/home/PhaseVisualization';
import CosmicSection from '../../src/components/home/CosmicSection';
import RecapCard from '../../src/components/home/RecapCard';
import EducationCard from '../../src/components/home/EducationCard';
import PersonalMetricsCard from '../../src/components/home/PersonalMetricsCard';
import CommunityCard from '../../src/components/home/CommunityCard';
import InsightCard from '../../src/components/home/InsightCard';
import CompletionBanner from '../../src/components/home/CompletionBanner';
import QuickActionSheet, { type QuickAction } from '../../src/components/home/QuickActionSheet';
import { LoadFailure, LoadPlaceholder, StaleNotice } from '../../src/components/app/LoadFailure';
import { brand, radius, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';
import { useShelf } from '../../src/api/shelf-provider';
import { canRenderContent, describeLoad } from '../../src/api/load-state';
import { FEELINGS, reflectionFor, type Feeling } from '../../src/daily-edition';
import { MORE_TAGS, PRIMARY_TAGS, RECOMMENDATIONS, phaseForNight, selectedDayLabel } from '../../src/stardust-feed';

export default function Home() {
  const { data, loading, error, hasLoaded, reload } = useMeShared();
  const shelf = useShelf();
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const scrollRef = useRef<ScrollViewType | null>(null);
  const forecastY = useRef(0);
  const checkInY = useRef(0);
  const journeyY = useRef(0);
  const recapY = useRef(0);
  const announcedSealKey = useRef<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedNight, setSelectedNight] = useState<number | null>(null);
  const [lockedNight, setLockedNight] = useState<number | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [completionVisible, setCompletionVisible] = useState(false);

  const match = data?.match ?? null;
  const currentNight = match?.day ?? 1;
  const activeNight = selectedNight ?? currentNight;
  const completedNights = data?.entries?.map((entry) => entry.day) ?? [];
  const sealedTonight = !!(match && completedNights.includes(match.day));
  const sealKey = sealedTonight ? `${data?.user?.id ?? 0}:${match?.day ?? 0}` : null;

  function scrollTo(y: number) {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, y - space.md), animated: true }));
  }

  useFocusEffect(useCallback(() => {
    if (sealKey && announcedSealKey.current !== sealKey) {
      announcedSealKey.current = sealKey;
      setCompletionVisible(true);
    }
    const target = params.section === 'check-in' ? checkInY.current : params.section === 'journey' ? journeyY.current : 0;
    if (target) setTimeout(() => scrollTo(target), 80);
  }, [params.section, sealKey]));

  function toggleTag(id: string) {
    setSelectedTags((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function handleAction(action: QuickAction | 'write' | 'check-in' | 'journey') {
    setActionsOpen(false);
    if (action === 'write' || action === 'reflection') router.push(match ? '/rooms' : '/scan');
    else scrollTo(action === 'check-in' ? checkInY.current : journeyY.current);
  }

  async function refreshFeed() {
    await Promise.all([reload(), shelf.reload()]);
  }

  const view = describeLoad({ loading, error, hasLoaded });
  const shelfView = describeLoad({ loading: shelf.loading, error: shelf.error, hasLoaded: shelf.hasLoaded });
  const shelfKnown = canRenderContent(shelfView);
  if (view === 'first-load') return <CosmicScreen><LoadPlaceholder label="Loading today’s edition" /></CosmicScreen>;
  if (view === 'failed') return <CosmicScreen><LoadFailure error={error} onRetry={() => void reload()} busy={loading} /></CosmicScreen>;

  const fullName = data?.user?.name?.trim() || null;
  const name = fullName?.split(/\s+/)[0] || null;
  const initial = fullName?.charAt(0).toUpperCase() || 'M';
  const phase = phaseForNight(match ? currentNight : 0);
  const primaryFeelings = selectedTags.filter((tag): tag is Feeling => (FEELINGS as readonly string[]).includes(tag));
  const insight = primaryFeelings.length > 0
    ? reflectionFor(primaryFeelings)
    : selectedTags.length > 0
      ? 'More than one feeling can be present without becoming a verdict.'
      : reflectionFor([]);
  const forecastPrompt = match?.currentPrompt ?? 'What kind of connection would feel honest to enter?';
  const selectedEntry = data?.entries?.find((entry) => entry.day === activeNight);
  const isCurrentSelection = activeNight === currentNight;
  const visiblePrompt = isCurrentSelection
    ? forecastPrompt
    : selectedEntry
      ? `Night ${activeNight} is sealed in your private archive.`
      : `Night ${activeNight} has no sealed entry.`;
  const status = match ? (sealedTonight ? 'SEALED' : phase.label) : 'PREPARING';
  const partnerPresent = data?.partnerStatus?.partnerHasWrittenToday ?? false;
  const streak = data?.streak ?? 0;

  return (
    <CosmicScreen scrollRef={scrollRef} refreshing={loading || shelf.loading} onRefresh={() => void refreshFeed()}>
      <FeedHeader name={name} initial={initial} onNotifications={() => router.push('/notification-settings')} />
      {view === 'stale' ? <StaleNotice error={error} onRetry={() => void reload()} busy={loading} /> : null}

      <View style={styles.dateSection}>
        <Text style={styles.dateEyebrow}>CHOOSE A DAY</Text>
        <DateStrip
          selectedNight={activeNight}
          currentNight={currentNight}
          completedNights={completedNights}
          onSelect={(night, locked) => {
            if (locked) {
              setLockedNight(night);
              return;
            }
            setLockedNight(null);
            setSelectedNight(night);
            scrollTo(forecastY.current);
          }}
        />
        {lockedNight ? <Text accessibilityLiveRegion="polite" style={styles.locked}>Night {lockedNight} opens when it arrives.</Text> : null}
      </View>

      <CompletionBanner night={currentNight} visible={completionVisible} onFinished={() => setCompletionVisible(false)} />

      <View style={styles.dayStatus}>
        <View><Text style={styles.dayLabel}>{selectedDayLabel(activeNight, currentNight).toUpperCase()}</Text><Text style={styles.dayTitle}>{match ? `Night ${String(activeNight).padStart(2, '0')}` : 'Before night one'}</Text></View>
        <View style={styles.phasePill}><Text style={styles.phaseText}>{isCurrentSelection ? status : selectedEntry ? 'SEALED' : 'PAST'}</Text></View>
      </View>

      <View onLayout={(event) => { forecastY.current = event.nativeEvent.layout.y; }}>
        <ForecastCard night={activeNight} prompt={visiblePrompt} status={isCurrentSelection ? status : selectedEntry ? 'SEALED' : 'ARCHIVE'} actionLabel={isCurrentSelection ? 'Open daily detail' : 'View day details'} onPress={() => isCurrentSelection ? handleAction('write') : scrollTo(recapY.current)} />
      </View>

      <DailyFeedSection eyebrow="FOR YOUR EVENING" title="Two ways in">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {RECOMMENDATIONS.slice(0, 2).map((item) => <RecommendationCard key={item.id} item={item} onPress={() => handleAction(item.action)} />)}
        </ScrollView>
      </DailyFeedSection>

      <DailyFeedSection eyebrow="CONNECTION" title="The social weather">
        <SocialForecastCard
          hasMatch={!!match}
          partnerPresent={partnerPresent}
          onPrimary={() => router.push(match ? '/rooms' : '/scan')}
          onSecondary={() => router.push(match ? '/safety-privacy' : '/create')}
        />
      </DailyFeedSection>

      <View onLayout={(event) => { checkInY.current = event.nativeEvent.layout.y; }}>
        <DailyFeedSection eyebrow="YOU’RE FEELING" title="What is present?" actionLabel="Clear" onAction={() => setSelectedTags([])}>
          <TagGrid tags={PRIMARY_TAGS} selected={selectedTags} onToggle={toggleTag} onAddMore={() => setMoreOpen(true)} />
          {selectedTags.length > 0 ? <Text accessibilityLiveRegion="polite" style={styles.selectedCopy}>{selectedTags.join(' · ')}</Text> : null}
        </DailyFeedSection>
      </View>

      <View onLayout={(event) => { journeyY.current = event.nativeEvent.layout.y; }}>
        <DailyFeedSection eyebrow="YOUR PHASE" title="The shape of the 21 nights">
          <PhaseVisualization night={match ? currentNight : 0} completed={completedNights.length} onPress={() => router.push('/journey')} />
        </DailyFeedSection>
      </View>

      <DailyFeedSection eyebrow="REFLECTION" title="A small editorial note" actionLabel="Save" onAction={() => setActionsOpen(true)}>
        <InsightCard text={insight} active={selectedTags.length > 0} onPress={() => handleAction('reflection')} />
      </DailyFeedSection>

      <DailyFeedSection eyebrow="PERSONAL METRICS" title="Your ritual rhythm">
        <PersonalMetricsCard sealed={completedNights.length} streak={streak} night={match ? currentNight : 0} />
      </DailyFeedSection>

      <DailyFeedSection eyebrow="FRIENDS" title="Your community">
        <CommunityCard hasMatch={!!match} partnerPresent={partnerPresent} onPress={() => router.push(match ? '/rooms' : '/safety-privacy')} />
      </DailyFeedSection>

      <DailyFeedSection eyebrow="COSMIC & EDUCATION" title="A wider view">
        <CosmicSection onPress={() => setActionsOpen(true)} />
        <EducationCard onPress={() => router.push('/safety-privacy')} />
      </DailyFeedSection>

      <View onLayout={(event) => { recapY.current = event.nativeEvent.layout.y; }}>
        <DailyFeedSection eyebrow="RECAP" title="What has accumulated">
          <RecapCard completed={completedNights.length} streak={streak} onPress={() => router.push('/journey')} />
        </DailyFeedSection>
      </View>

      {shelfKnown ? <ShelfStrip byKind={shelf.byKind} title="Your cultural shelf" /> : shelfView === 'failed' ? <LoadFailure error={shelf.error} onRetry={() => void shelf.reload()} busy={shelf.loading} /> : <LoadPlaceholder label="Loading your shelf" />}

      <View style={styles.end}><Text style={styles.endEyebrow}>END OF TODAY’S EDITION</Text><Text style={styles.endCopy}>{match ? `Night ${currentNight + (currentNight < 21 ? 1 : 0)} arrives in its own time.` : 'Your first night begins with a real connection.'}</Text></View>

      <AddMoreSheet visible={moreOpen} tags={MORE_TAGS} selected={selectedTags} onToggle={toggleTag} onClose={() => setMoreOpen(false)} />
      <QuickActionSheet visible={actionsOpen} onClose={() => setActionsOpen(false)} onAction={handleAction} />
    </CosmicScreen>
  );
}

function FeedHeader({ name, initial, onNotifications }: { name: string | null; initial: string; onNotifications: () => void }) {
  const currentDate = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  return <View style={styles.header}><View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View><View><Text style={styles.greeting}>{currentDate}</Text><Text style={styles.headerTitle}>Good evening{name ? `, ${name}` : ''}</Text></View></View><Pressable onPress={onNotifications} accessibilityRole="button" accessibilityLabel="Notifications and settings" style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}><Text style={styles.settingsIcon}>◌</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  header: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  identity: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: brand.rose, alignItems: 'center', justifyContent: 'center', marginRight: space.md },
  avatarText: { ...type.bodyStrong, color: brand.void, fontSize: 17 },
  greeting: { ...type.bodySmall, color: brand.inkMid, fontSize: 10.5 },
  headerTitle: { ...type.bodyStrong, color: brand.ink, fontSize: 22, lineHeight: 28 },
  settingsButton: { width: 44, height: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: brand.line, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { color: brand.gold, fontSize: 26, lineHeight: 28 },
  dateSection: { marginTop: space.xl },
  dateEyebrow: { ...type.eyebrow, color: brand.rose, fontSize: 8 },
  dayStatus: { marginTop: space.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayLabel: { ...type.eyebrow, color: brand.rose, fontSize: 8 },
  dayTitle: { ...type.bodyStrong, color: brand.ink, fontSize: 22, lineHeight: 28, marginTop: 2 },
  phasePill: { minHeight: 38, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(236,200,133,0.32)', backgroundColor: 'rgba(236,200,133,0.07)', alignItems: 'center', justifyContent: 'center' },
  phaseText: { ...type.eyebrow, color: brand.gold, fontSize: 7.5 },
  locked: { ...type.bodySmall, color: brand.gold, marginTop: space.sm },
  cardRow: { gap: space.md, paddingTop: space.lg, paddingRight: space.xl },
  selectedCopy: { ...type.bodySmall, color: brand.inkMid, marginTop: space.md },
  end: { marginTop: space.xxl, paddingVertical: space.xl, alignItems: 'center' },
  endEyebrow: { ...type.eyebrow, color: brand.inkLow, fontSize: 8 },
  endCopy: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm, textAlign: 'center' },
  pressed: { opacity: 0.72 },
});
