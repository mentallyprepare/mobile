import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import DaylightScreen from '../../src/components/DaylightScreen';
import DaylightCard from '../../src/components/DaylightCard';
import Illustration from '../../src/components/Illustration';
import { daylight, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';
import { useSession } from '../../src/session';

/**
 * You — identity, archetype, streak, sign out. Daylight surface. The old
 * Mirror content lives here now; the archetype line stays but the composition
 * moves out of the ritual's dark palette (the ritual is inside a Room only).
 */
export default function You() {
  const { data, loading } = useMeShared();
  const { signOut } = useSession();

  if (loading) {
    return (
      <DaylightScreen>
        <ActivityIndicator color={daylight.accent} style={{ marginTop: space.huge }} />
      </DaylightScreen>
    );
  }

  const archetype = data?.user?.archetype ?? null;
  const name = data?.user?.name ?? null;
  const streak = data?.streak ?? 0;
  const match = data?.match ?? null;

  return (
    <DaylightScreen>
      <View style={styles.header}>
        <Illustration slot="you-hero" size={72} />
        <View style={styles.headerText}>
          <Text style={styles.archetype}>{archetype ?? 'not scanned yet'}</Text>
          {name ? <Text style={styles.name}>{name}</Text> : null}
        </View>
      </View>

      {streak > 0 ? (
        <DaylightCard style={styles.card} accent="amber">
          <Text style={styles.streak}>
            {streak} {streak === 1 ? 'night' : 'nights'} in a row.
          </Text>
        </DaylightCard>
      ) : null}

      {match ? (
        <DaylightCard style={styles.card} accent="violet">
          <Text style={styles.section}>YOUR MATCH</Text>
          <Text style={styles.matchLine}>
            someone from another college, night {match.day} with you
          </Text>
        </DaylightCard>
      ) : null}

      <View style={styles.foot}>
        <Pressable
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={styles.signOut}
        >
          <Text style={styles.signOutLabel}>sign out</Text>
        </Pressable>
      </View>
    </DaylightScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  headerText: { flex: 1 },
  archetype: {
    ...type.displayItalic,
    fontSize: 32,
    lineHeight: 38,
    color: daylight.ink,
  },
  name: {
    ...type.body,
    color: daylight.inkMid,
    marginTop: 6,
  },
  card: { marginTop: space.xl },
  streak: { ...type.displayItalic, fontSize: 22, color: daylight.ink },
  section: {
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 1.4,
    color: daylight.inkMid,
    marginBottom: 6,
  },
  matchLine: { ...type.body, fontSize: 15, lineHeight: 23, color: daylight.ink },
  foot: { marginTop: space.huge },
  signOut: { alignSelf: 'flex-start', paddingVertical: 8 },
  signOutLabel: { ...type.body, fontSize: 13.5, color: daylight.inkMid },
});
