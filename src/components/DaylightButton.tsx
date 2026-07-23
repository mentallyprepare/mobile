import { Pressable, StyleSheet, Text, View } from 'react-native';
import { daylight, radius, type } from '../design';

type DaylightButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  block?: boolean;
};

/** Daylight CTA. Solid moon-violet for primary; outlined for ghost. */
export default function DaylightButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  block = false,
}: DaylightButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <View style={[block && styles.block, disabled && styles.disabled]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.button,
          isPrimary ? styles.primary : styles.ghost,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelGhost]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: daylight.accent,
  },
  ghost: {
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: 'transparent',
  },
  block: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  label: { ...type.bodyStrong, fontSize: 15 },
  labelPrimary: { color: daylight.surface },
  labelGhost: { color: daylight.ink },
});
