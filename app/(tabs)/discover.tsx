import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import CommunityCard from '../../src/components/home/CommunityCard';
import { LoadFailure, LoadPlaceholder, StaleNotice } from '../../src/components/app/LoadFailure';
import { useMeShared } from '../../src/api/me-provider';
import { describeLoad } from '../../src/api/load-state';
import { brand, radius, space, type } from '../../src/design';

export default function Community() {
  const router = useRouter();
  const { data, loading, error, hasLoaded, reload } = useMeShared();
  const view = describeLoad({ loading, error, hasLoaded });

  if (view === 'first-load') return <CosmicScreen><LoadPlaceholder label="Opening community" /></CosmicScreen>;
  if (view === 'failed') return <CosmicScreen><LoadFailure error={error} onRetry={() => void reload()} busy={loading} /></CosmicScreen>;

  const hasMatch = !!data?.match;
  const partnerPresent = data?.partnerStatus?.partnerHasWrittenToday ?? false;
  return (
    <CosmicScreen refreshing={loading} onRefresh={() => void reload()}>
      <Text style={styles.kicker}>COMMUNITY</Text>
      <Text style={styles.title}>Connection without a public feed.</Text>
      <Text style={styles.body}>This space shows consented presence and shared-room actions. It never exposes private notes, popularity counts, or inferred compatibility.</Text>
      {view === 'stale' ? <StaleNotice error={error} onRetry={() => void reload()} busy={loading} /> : null}
      <CommunityCard hasMatch={hasMatch} partnerPresent={partnerPresent} onPress={() => router.push(hasMatch ? '/rooms' : '/scan')} />

      {!hasMatch ? (
        <Pressable
          onPress={() => router.push('/tonights' as Href)}
          accessibilityRole="button"
          accessibilityLabel="Open Tonight's Question"
          accessibilityHint="A community writing prompt for anyone still waiting to be paired"
          style={({ pressed }) => [styles.tonights, pressed && styles.pressed]}
        >
          <Text style={styles.tonightsKicker}>TONIGHT&apos;S QUESTION</Text>
          <Text style={styles.tonightsTitle}>write while you wait.</Text>
          <Text style={styles.tonightsBody}>
            One prompt tonight, shared with others still waiting to be paired.
          </Text>
          <Text style={styles.tonightsArrow}>open →</Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => router.push('/silent' as Href)}
        accessibilityRole="button"
        accessibilityLabel="Open the Silent Room"
        accessibilityHint="One line, no replies, gone in seven days"
        style={({ pressed }) => [styles.silent, pressed && styles.pressed]}
      >
        <Text style={styles.silentKicker}>SILENT ROOM</Text>
        <Text style={styles.silentTitle}>one line, no replies.</Text>
        <Text style={styles.silentBody}>
          Share what won&apos;t fit anywhere else. It disappears in seven days.
        </Text>
        <Text style={styles.silentArrow}>open →</Text>
      </Pressable>

      <View style={styles.boundary}><Text style={styles.boundaryTitle}>The boundary</Text><Text style={styles.boundaryBody}>No stranger browsing, public profiles, or activity leaderboard exists in this beta.</Text></View>
      <Pressable onPress={() => router.push('/safety-privacy' as Href)} accessibilityRole="button" accessibilityLabel="Open community safety and privacy" style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>Safety & privacy</Text></Pressable>
    </CosmicScreen>
  );
}

const styles = StyleSheet.create({
  kicker: { ...type.eyebrow, color: brand.rose, fontSize: 9 }, title: { ...type.displayItalic, color: brand.ink, fontSize: 36, lineHeight: 42, marginTop: space.sm }, body: { ...type.body, color: brand.inkMid, marginTop: space.sm, maxWidth: 390 },
  boundary: { marginTop: space.xl, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: brand.line, backgroundColor: brand.card }, boundaryTitle: { ...type.bodyStrong, color: brand.ink }, boundaryBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs },
  silent: { marginTop: space.lg, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: brand.line, backgroundColor: brand.card },
  silentKicker: { ...type.eyebrow, color: brand.rose, fontSize: 10, letterSpacing: 1.6 },
  silentTitle: { ...type.displayItalic, color: brand.ink, fontSize: 22, lineHeight: 28, marginTop: space.xs },
  silentBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm, lineHeight: 19 },
  silentArrow: { ...type.bodyStrong, color: brand.rose, marginTop: space.md, fontSize: 14 },
  tonights: { marginTop: space.lg, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: brand.line, backgroundColor: brand.card },
  tonightsKicker: { ...type.eyebrow, color: brand.gold, fontSize: 10, letterSpacing: 1.6 },
  tonightsTitle: { ...type.displayItalic, color: brand.ink, fontSize: 22, lineHeight: 28, marginTop: space.xs },
  tonightsBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm, lineHeight: 19 },
  tonightsArrow: { ...type.bodyStrong, color: brand.gold, marginTop: space.md, fontSize: 14 },
  action: { minHeight: 50, marginTop: space.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: brand.line, alignItems: 'center', justifyContent: 'center' }, actionText: { ...type.bodyStrong, color: brand.rose }, pressed: { opacity: 0.72 },
});
