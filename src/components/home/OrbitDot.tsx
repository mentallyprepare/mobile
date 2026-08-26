import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { brand } from '../../design';

type OrbitDotProps = { width?: number; height?: number; color?: string; duration?: number };

export default function OrbitDot({ width = 238, height = 150, color = brand.rose, duration = 10000 }: OrbitDotProps) {
  const [rotation] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (mounted) setReducedMotion(enabled); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      rotation.stopAnimation(); pulse.stopAnimation(); rotation.setValue(0); pulse.setValue(0);
      return;
    }
    const orbit = Animated.loop(Animated.timing(rotation, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    const breathing = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    orbit.start(); breathing.start();
    return () => { orbit.stop(); breathing.stop(); };
  }, [duration, pulse, reducedMotion, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.82] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.22] });

  return (
    <View accessible accessibilityLabel={reducedMotion ? 'Personal cycle orbit' : 'Animated personal cycle orbit'} style={[styles.root, { width, height }]}>
      <View style={[styles.orbit, { width, height, borderRadius: height / 2 }]} />
      <Animated.View pointerEvents="none" style={[styles.rotating, { width, height, transform: [{ rotate }] }]}>
        <Animated.View style={[styles.glow, { left: width / 2 - 14, backgroundColor: color, opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
        <View style={[styles.dot, { left: width / 2 - 5, backgroundColor: color }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-10deg' }] },
  orbit: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(242,210,220,0.24)' },
  rotating: { position: 'absolute' },
  dot: { position: 'absolute', top: -5, width: 10, height: 10, borderRadius: 5, shadowColor: brand.rose, shadowOpacity: 0.95, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  glow: { position: 'absolute', top: -14, width: 28, height: 28, borderRadius: 14 },
});
