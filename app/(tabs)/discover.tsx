import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import { brand, radius, space, type } from '../../src/design';
import { useShelf } from '../../src/api/shelf-provider';

/** Direct route only. It stays out of tab navigation until discovery is real. */
export default function Discover() {
  const { byKind } = useShelf();
  const router = useRouter();
  const count = Object.values(byKind).filter(Boolean).length;

  return (
    <CosmicScreen>
      <Text style={styles.screenLabel}>DISCOVER</Text>
      <Text style={styles.title}>Not available in this beta</Text>
      <Text style={styles.subtitle}>
        Discovery will appear in navigation after its matching and safety systems are ready.
      </Text>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>YOUR SHELF</Text>
        <Text style={styles.statusValue}>{count} of 5 completed</Text>
      </View>

      <Pressable
        onPress={() => router.push('/create')}
        accessibilityRole="button"
        accessibilityLabel="Open your shelf"
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionText}>Open shelf</Text>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
    </CosmicScreen>
  );
}

const styles = StyleSheet.create({
  screenLabel: {
    ...type.eyebrow,
    color: brand.inkLow,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  title: {
    ...type.display,
    color: brand.ink,
    fontSize: 36,
    lineHeight: 41,
    marginTop: space.sm,
  },
  subtitle: { ...type.body, color: brand.inkMid, marginTop: space.sm, maxWidth: 340 },
  status: {
    marginTop: space.xl,
    paddingVertical: space.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: brand.line,
  },
  statusLabel: {
    ...type.eyebrow,
    color: brand.inkLow,
    fontSize: 8.5,
    letterSpacing: 1.1,
  },
  statusValue: { ...type.bodyStrong, color: brand.ink, marginTop: 6 },
  action: {
    minHeight: 50,
    marginTop: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: { ...type.bodyStrong, color: brand.void },
  arrow: { color: brand.void, fontSize: 19 },
  pressed: { opacity: 0.75 },
});
