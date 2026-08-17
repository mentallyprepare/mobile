import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import Constellation from '../../src/components/journey/Constellation';
import DateStrip from '../../src/components/home/DateStrip';
import PhaseVisualization from '../../src/components/home/PhaseVisualization';
import RecapCard from '../../src/components/home/RecapCard';
import { LoadFailure, LoadPlaceholder, StaleNotice } from '../../src/components/app/LoadFailure';
import { useMeShared } from '../../src/api/me-provider';
import { describeLoad } from '../../src/api/load-state';
import { brand, space, type } from '../../src/design';

export default function Journey() {
  const router = useRouter();
  const { data, loading, error, hasLoaded, reload } = useMeShared();
  const view = describeLoad({ loading, error, hasLoaded });
  const currentNight = data?.match?.day ?? 1;
  const [selectedNight, setSelectedNight] = useState(currentNight);
  const [notice, setNotice] = useState<string | null>(null);
  const completed = data?.entries?.map((entry) => entry.day) ?? [];

  if (view === 'first-load') return <CosmicScreen><LoadPlaceholder label="Loading your journey" /></CosmicScreen>;
  if (view === 'failed') return <CosmicScreen><LoadFailure error={error} onRetry={() => void reload()} busy={loading} /></CosmicScreen>;

  return (
    <CosmicScreen refreshing={loading} onRefresh={() => void reload()}>
      <Text style={styles.kicker}>JOURNEY</Text>
      <Text style={styles.title}>The nights you have carried.</Text>
      <Text style={styles.body}>Completion and timing form the visible path. Your private words remain outside this view.</Text>
      {view === 'stale' ? <StaleNotice error={error} onRetry={() => void reload()} busy={loading} /> : null}
      <View style={styles.strip}>
        <DateStrip selectedNight={selectedNight} currentNight={currentNight} completedNights={completed} onSelect={(night, locked) => { if (locked) return setNotice(`Night ${night} opens when it arrives.`); setNotice(null); setSelectedNight(night); }} />
      </View>
      {notice ? <Text style={styles.notice} accessibilityLiveRegion="polite">{notice}</Text> : null}
      <Constellation
        entries={data?.entries ?? []}
        partnerEntries={data?.partnerEntries ?? []}
        userId={data?.user?.id ?? 0}
        onSelectNight={(night) => {
          setSelectedNight(night);
          setNotice(null);
        }}
      />
      <PhaseVisualization night={data?.match ? currentNight : 0} completed={completed.length} onPress={() => router.push('/rooms')} />
      <RecapCard completed={completed.length} streak={data?.streak ?? 0} onPress={() => router.push('/rooms')} />
    </CosmicScreen>
  );
}

const styles = StyleSheet.create({
  kicker: { ...type.eyebrow, color: brand.rose, fontSize: 9 }, title: { ...type.displayItalic, color: brand.ink, fontSize: 36, lineHeight: 42, marginTop: space.sm }, body: { ...type.body, color: brand.inkMid, marginTop: space.sm, maxWidth: 390 }, strip: { marginTop: space.xl }, notice: { ...type.bodySmall, color: brand.gold, marginTop: space.sm },
});
