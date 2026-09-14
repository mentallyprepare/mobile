import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack } from 'expo-router';
import { brand, radius, space, type } from '../src/design';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

/**
 * The route expo-router falls back to when nothing matches. Without this the
 * app freezes on an empty screen with no way home after a dead notification
 * link, a stale deep link, or a route removed between build and tap.
 *
 * Same quiet voice as ErrorBoundary and LoadFailure. Says one true thing —
 * this address does not exist — and offers the one useful move: go home.
 */
export default function NotFound() {
  useLanguage(); // re-render when the language changes
  const cta = t('not_found.cta');
  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t('not_found.screen_title') }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.panel}>
          <View style={styles.mark} />
          <Text style={styles.headline}>{t('not_found.headline')}</Text>
          <Text style={styles.detail}>{t('not_found.detail')}</Text>
          <Link href="/" replace asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cta}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            >
              <Text style={styles.ctaLabel}>{cta}</Text>
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
