import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';

export default function CompletionBanner({
  night,
  visible,
  onFinished,
}: {
  night: number;
  visible: boolean;
  onFinished: () => void;
}) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(8));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(reduceMotion ? 1 : 0);
    translateY.setValue(reduceMotion ? 0 : 8);

    const entrance = reduceMotion
      ? null
      : Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]);
    entrance?.start();

    const timeout = setTimeout(onFinished, 4200);
    return () => {
      entrance?.stop();
      clearTimeout(timeout);
    };
  }, [night, onFinished, opacity, reduceMotion, translateY, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { opacity, transform: [{ translateY }] }]}
    >
      <View style={styles.mark}><View style={styles.markCore} /></View>
      <View style={styles.copy}>
        <Text style={styles.kicker}>NIGHT {String(night).padStart(2, '0')} COMPLETE</Text>
        <Text style={styles.title}>Tonight is sealed.</Text>
        <Text style={styles.detail}>Your words remain private. Home has caught up.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 94,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(236,200,133,0.42)',
    backgroundColor: brand.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236,200,133,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(236,200,133,0.32)',
  },
  markCore: { width: 11, height: 11, borderRadius: 6, backgroundColor: brand.gold },
  copy: { flex: 1, marginLeft: space.md },
  kicker: { ...type.eyebrow, color: brand.gold, fontSize: 8, letterSpacing: 1.1 },
  title: { ...type.bodyStrong, color: brand.ink, fontSize: 16, marginTop: 2 },
  detail: { ...type.bodySmall, color: brand.inkMid, marginTop: 2 },
});
