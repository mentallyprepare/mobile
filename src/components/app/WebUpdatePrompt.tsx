import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';

const CHECK_INTERVAL_MS = 60_000;
const BUNDLE_PATTERN = /\/_expo\/static\/js\/web\/entry-[a-f0-9]+\.js/;

function bundlePathFromHtml(html: string): string | null {
  return html.match(BUNDLE_PATTERN)?.[0] ?? null;
}

function runningBundlePath(): string | null {
  if (typeof document === 'undefined') return null;
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="/_expo/static/js/web/entry-"]',
  );
  if (!script?.src) return null;
  return new URL(script.src, window.location.origin).pathname;
}

export default function WebUpdatePrompt() {
  const [nextBundle, setNextBundle] = useState<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const currentBundle = runningBundlePath();
    if (!currentBundle) return;

    try {
      const checkUrl = new URL(window.location.href);
      checkUrl.searchParams.set('update-check', Date.now().toString());
      const response = await fetch(checkUrl.toString(), {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!response.ok) return;
      const availableBundle = bundlePathFromHtml(await response.text());
      if (availableBundle && availableBundle !== currentBundle) {
        setNextBundle(availableBundle);
      }
    } catch {
      // Update checks are best-effort and must never interrupt the app.
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const initial = window.setTimeout(() => void checkForUpdate(), 0);
    const interval = window.setInterval(() => void checkForUpdate(), CHECK_INTERVAL_MS);
    const onFocus = () => void checkForUpdate();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void checkForUpdate();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [checkForUpdate]);

  if (Platform.OS !== 'web' || !nextBundle) return null;

  function refresh() {
    const release = nextBundle?.match(/entry-([a-f0-9]+)\.js/)?.[1] ?? Date.now().toString();
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('release', release);
    window.location.assign(nextUrl.toString());
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={styles.prompt}
    >
      <View style={styles.copy}>
        <Text style={styles.title}>A newer version is ready.</Text>
        <Text style={styles.detail}>Refresh when you are ready. Your saved work stays safe.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Refresh to use the newest version"
        onPress={refresh}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionLabel}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    position: 'absolute',
    right: space.lg,
    bottom: 92,
    left: space.lg,
    zIndex: 1000,
    minHeight: 76,
    padding: space.md,
    borderWidth: 1,
    borderColor: 'rgba(235,180,194,0.32)',
    borderRadius: radius.lg,
    backgroundColor: brand.card,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: { flex: 1, paddingRight: space.md },
  title: { ...type.bodyStrong, color: brand.ink },
  detail: { ...type.bodySmall, color: brand.inkMid, marginTop: 2 },
  action: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { ...type.bodyStrong, color: brand.void },
  pressed: { opacity: 0.76 },
});
