import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import DaylightScreen from '../../src/components/DaylightScreen';
import DaylightCard from '../../src/components/DaylightCard';
import Illustration from '../../src/components/Illustration';
import { daylight, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';

/**
 * Create is contextual. When a Room is active, tapping Create routes straight
 * to tonight's writing. Otherwise it should route to add-to-shelf; the shelf
 * flow is not yet built, so this screen shows a truthful placeholder rather
 * than a button that does nothing.
 *
 * See docs/design-daylight-world.md.
 */
export default function Create() {
  const { data } = useMeShared();
  const router = useRouter();
  const inRoom = !!data?.match;

  // If we opened Create while in a Room, jump to writing.
  useFocusEffect(
    useCallback(() => {
      if (inRoom) router.replace('/rooms');
    }, [inRoom, router])
  );

  useEffect(() => {
    if (inRoom) router.replace('/rooms');
  }, [inRoom, router]);

  if (inRoom) {
    // Momentary flash before the redirect; keep it quiet.
    return <DaylightScreen><View /></DaylightScreen>;
  }

  return (
    <DaylightScreen>
      <Text style={styles.title}>add to your shelf.</Text>
      <Text style={styles.sub}>
        the songs, films, books and memories that are honestly you.
      </Text>

      <DaylightCard style={styles.card} accent="rose">
        <View style={styles.emptyRow}>
          <Illustration slot="shelf-empty" size={80} />
          <View style={styles.emptyText}>
            <Text style={styles.emptyTitle}>not open yet.</Text>
            <Text style={styles.emptyBody}>
              the shelf is the next thing being built. you can already write
              tonight if you are in a room.
            </Text>
          </View>
        </View>
      </DaylightCard>
    </DaylightScreen>
  );
}

const styles = StyleSheet.create({
  title: { ...type.displayItalic, color: daylight.ink },
  sub: { ...type.body, color: daylight.inkMid, marginTop: space.sm },
  card: { marginTop: space.xl },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  emptyText: { flex: 1 },
  emptyTitle: { ...type.bodyStrong, fontSize: 16, color: daylight.ink },
  emptyBody: { ...type.body, color: daylight.inkMid, marginTop: 6 },
});
