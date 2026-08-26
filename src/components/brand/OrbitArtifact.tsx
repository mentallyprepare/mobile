import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { brand } from '../../design';

type OrbitArtifactProps = {
  size?: number;
};

/**
 * The authored 3D expression of the Mentally Prepare mark.
 *
 * It is intentionally reserved for entry and ritual moments. Product screens
 * keep using the simpler SVG mark so the interface remains quick and useful.
 */
export default function OrbitArtifact({ size = 72 }: OrbitArtifactProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (reduceMotion) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion]);

  const motion = {
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.015],
        }),
      },
    ],
  };

  return (
    <View
      style={[styles.frame, { width: size, height: size }]}
      accessibilityRole="image"
      accessibilityLabel="Mentally Prepare orbit"
    >
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: size,
          },
        ]}
      />
      <Animated.View style={[styles.art, motion]}>
        <Image
          source={require('../../../assets/images/mentally-prepare-orbit.png')}
          resizeMode="contain"
          style={{ width: size, height: size }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: brand.purple,
    opacity: 0.2,
    shadowColor: brand.rose,
    shadowOpacity: 0.32,
    shadowRadius: 16,
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
