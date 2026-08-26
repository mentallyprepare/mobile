import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { brand, radius, space } from '../../design';

const PALETTES = {
  violet: { backgroundColor: '#171024', borderColor: 'rgba(137,108,181,0.36)' },
  rose: { backgroundColor: '#1A1018', borderColor: 'rgba(235,180,194,0.26)' },
  blue: { backgroundColor: brand.card, borderColor: brand.line },
  gold: { backgroundColor: '#18140D', borderColor: 'rgba(236,200,133,0.24)' },
  glass: { backgroundColor: brand.card, borderColor: brand.line },
} as const;

export default function CosmicCard({
  children,
  palette = 'glass',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: {
  children: ReactNode;
  palette?: keyof typeof PALETTES;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
}) {
  const card = (
    <View style={[styles.card, PALETTES[palette], style]}>
      {children}
    </View>
  );

  if (!onPress) return card;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    padding: space.xl,
    borderWidth: 1,
  },
  pressed: { opacity: 0.78 },
});
