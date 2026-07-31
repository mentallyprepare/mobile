import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack } from 'expo-router';
import { brand, radius, space, type } from '../src/design';

/**
 * The route expo-router falls back to when nothing matches. Without this the
 * app freezes on an empty screen with no way home after a dead notification
 * link, a stale deep link, or a route removed between build and tap.
 *
 * Same quiet voice as ErrorBoundary and LoadFailure. Says one true thing —
 * this address does not exist — and offers the one useful move: go home.
 */
export default function NotFound() {
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Not found' }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.panel}>
          <View style={styles.mark} />
          <Text style={styles.headline}>This page isn’t here.</Text>
          <Text style={styles.detail}>
            The link may be old, or the screen may have moved. Everything you wrote
            is still on the home screen.
          </Text>
          <Link href="/" replace asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go home"
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            >
              <Text style={styles.ctaLabel}>Go home</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1, padding: space.lg, justifyContent: 'center' },
  panel: {
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  mark: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginBottom: space.lg,
    backgroundColor: brand.gold,
  },
  headline: { ...type.display, color: brand.ink, fontSize: 26, lineHeight: 31 },
  detail: { ...type.body, color: brand.inkMid, marginTop: space.sm },
  cta: {
    minHeight: 48,
    marginTop: space.xl,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: { ...type.bodyStrong, color: brand.void, fontSize: 15 },
  pressed: { opacity: 0.78 },
});
