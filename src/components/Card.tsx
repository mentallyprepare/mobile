import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { surface } from '../theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Warmer variant, for the match's own surfaces. */
  accent?: boolean;
};

/** Panel surface: cool-to-warm gradient with a hairline edge. */
export default function Card({ children, style, accent = false }: CardProps) {
  return (
    <LinearGradient
      colors={
        accent
          ? ['rgba(168,155,240,0.10)', 'rgba(212,133,154,0.03)']
          : surface.gradient
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: surface.border,
    overflow: 'hidden',
  },
});
