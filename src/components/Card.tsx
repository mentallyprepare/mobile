import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { cosmos, radius, surface } from '../theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Warmer variant, for a meaningful or active surface. */
  accent?: boolean;
  /** Selected objects carry a clearer edge without becoming neon. */
  selected?: boolean;
};

export default function Card({ children, style, accent = false, selected = false }: CardProps) {
  return (
    <LinearGradient
      colors={accent
        ? ['rgba(168,155,240,0.12)', 'rgba(196,125,145,0.055)']
        : ['rgba(248,242,255,0.062)', 'rgba(212,133,154,0.022)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, selected && styles.selected, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: surface.border,
    overflow: 'hidden',
  },
  selected: {
    borderWidth: 1,
    borderColor: cosmos.selectedBorder,
    shadowColor: cosmos.lavender,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
});
