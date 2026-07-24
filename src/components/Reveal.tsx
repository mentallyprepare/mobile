import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';

type RevealProps = { children: ReactNode };

/** A restrained native entrance that becomes completely static for reduced motion. */
export default function Reveal({ children }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reducedMotion]);

  return (
    <Animated.View
      style={[
        styles.fill,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
