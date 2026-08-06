import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { brand, daylight, radius, space } from '../design';

type DaylightCardProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accent?: 'violet' | 'rose' | 'amber' | 'moss' | 'blue';
  style?: ViewStyle;
};

const ACCENT_LINE: Record<NonNullable<DaylightCardProps['accent']>, string> = {
  violet: daylight.accent,
  rose: daylight.accentRose,
  amber: daylight.accentAmber,
  moss: daylight.accentMoss,
  blue: daylight.accentBlue,
};

/**
 * Daylight card. Chunky rounded, off-white, soft shadow. A press variant is
 * built in so tappable cards do not need their own Pressable wrapper.
 */
export default function DaylightCard({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accent,
  style,
}: DaylightCardProps) {
  const accentStyle = accent ? { borderTopColor: ACCENT_LINE[accent], borderTopWidth: 3 } : null;
  const inner = (
    <View style={[styles.card, accentStyle, style]}>{children}</View>
  );
  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: daylight.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: daylight.border,
    // A soft daylight shadow, not the deep-night one.
    shadowColor: brand.void,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressed: { opacity: 0.85 },
});
