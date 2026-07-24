import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import DaylightScreen from '../../src/components/DaylightScreen';
import DaylightCard from '../../src/components/DaylightCard';
import Illustration from '../../src/components/Illustration';
import CosmicWelcome from '../../src/components/CosmicWelcome';
import { daylight, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';

/**
 * Home — a finite daily edition. Only shows a section when its data is real.
 * See docs/directive-native-social-app.md ("Home V1").
 */
export default function Home() {
  const { data, loading } = useMeShared();
  const router = useRouter();

  if (loading) {
    return (
      <DaylightScreen>
        <ActivityIndicator color={daylight.accent} style={{ marginTop: space.huge }} />
      </DaylightScreen>
    );
  }

  const name = data?.user?.name?.split(' ')[0] ?? null;
  const archetype = data?.user?.archetype ?? null;
  const match = data?.match ?? null;
  const streak = data?.streak ?? 0;
  const sealedTonight = !!(match && data?.entries?.some((e) => e.day === match.day));

  return (
    <DaylightScreen>
      <Text style={styles.hello}>hello{name ? `, ${name.toLowerCase()}` : ''}.</Text>
      <Text style={styles.date}>today</Text>

      {!match && !archetype ? <CosmicWelcome /> : null}

      {match ? (
        <DaylightCard
          accent="violet"
          style={styles.hero}
          onPress={() => router.push('/rooms')}
          accessibilityLabel={
            sealedTonight
              ? `Tonight sealed. Night ${match.day} of 21.`
              : `Tonight open. Night ${match.day} of 21.`
          }
          accessibilityHint="Opens your active 21-night Room"
        >
          <View style={styles.heroRow}>
            <Illustration slot="home-hero" size={72} />
            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>NIGHT {match.day} OF 21</Text>
              <Text style={styles.heroTitle}>
                {sealedTonight ? 'tonight is sealed.' : "tonight's room."}
              </Text>
              <Text style={styles.heroSub}>
                {sealedTonight
                  ? 'their note opens after midnight.'
                  : 'open the room to write.'}
              </Text>
            </View>
          </View>
        </DaylightCard>
      ) : !archetype ? (
        <DaylightCard
          style={styles.heroCompact}
          accent="rose"
          onPress={() => router.push('/scan')}
          accessibilityLabel="Take the scan"
          accessibilityHint="Eleven questions, about two minutes"
        >
          <Text style={styles.heroEyebrow}>ONE THING TO DO</Text>
          <Text style={styles.heroTitle}>take the scan.</Text>
          <Text style={styles.heroSub}>
            eleven questions. it names the pattern behind how you handle
            closeness.
          </Text>
        </DaylightCard>
      ) : (
        <DaylightCard style={styles.hero} accent="blue">
          <Text style={styles.heroTitle}>no room yet.</Text>
          <Text style={styles.heroSub}>
            when you find someone to do the nights with, they show up here.
          </Text>
        </DaylightCard>
      )}

      {streak > 0 ? (
        <View style={styles.streak}>
          <Text style={styles.streakN}>{streak}</Text>
          <Text style={styles.streakLbl}>
            {streak === 1 ? 'night in a row' : 'nights in a row'}
          </Text>
        </View>
      ) : null}
    </DaylightScreen>
  );
}

const styles = StyleSheet.create({
  hello: { ...type.displayItalic, color: daylight.ink },
  date: {
    ...type.eyebrow,
    fontSize: 11,
    letterSpacing: 1.4,
    color: daylight.inkMid,
    marginTop: space.sm,
    textTransform: 'uppercase',
  },
  hero: { marginTop: space.xl },
  heroCompact: { marginTop: space.md },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  heroText: { flex: 1 },
  heroEyebrow: {
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 1.4,
    color: daylight.accent,
  },
  heroTitle: {
    ...type.displayItalic,
    fontSize: 26,
    lineHeight: 32,
    color: daylight.ink,
    marginTop: 4,
  },
  heroSub: {
    ...type.body,
    color: daylight.inkMid,
    marginTop: 6,
  },
  streak: {
    marginTop: space.xl,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.sm,
  },
  streakN: { ...type.displayLarge, fontSize: 40, color: daylight.ink },
  streakLbl: { ...type.body, color: daylight.inkMid },
});
