import { View, Text, StyleSheet } from 'react-native';
import DaylightScreen from '../../src/components/DaylightScreen';
import DaylightCard from '../../src/components/DaylightCard';
import Illustration from '../../src/components/Illustration';
import { daylight, space, type } from '../../src/design';

/**
 * Discover — the finding phase. Backend contract is not yet built
 * (taste-identity, discovery, sparks); this screen is deliberately a truthful
 * unavailable state. No fake people, no invented counts.
 * See docs/directive-native-social-app.md ("DISCOVER V1").
 */
export default function Discover() {
  return (
    <DaylightScreen>
      <Text style={styles.title}>discover.</Text>
      <Text style={styles.sub}>find people whose inner world resonates.</Text>

      <DaylightCard style={styles.card} accent="blue">
        <View style={styles.emptyRow}>
          <Illustration slot="discover-empty" size={80} />
          <View style={styles.emptyText}>
            <Text style={styles.emptyTitle}>not open yet.</Text>
            <Text style={styles.emptyBody}>
              discovery is still being built. build your shelf in the meantime —
              that's what people will resonate with.
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
  footnote: {
    ...type.bodySmall,
    color: daylight.inkLow,
    marginTop: space.xl,
    fontStyle: 'italic',
  },
});
