import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cta, font, ink, radius } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Stretch to fill its container instead of hugging its label. */
  block?: boolean;
};

/**
 * The one saturated element on a screen. Carries the web app's rose-to-purple
 * gradient and deep shadow — a translucent pill reads as disabled.
 */
export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  block = false,
}: PrimaryButtonProps) {
  return (
    <View style={[styles.shadow, block && styles.block, disabled && styles.disabled]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        hitSlop={6}
        style={({ pressed }) => pressed && !disabled && styles.pressed}
      >
        <LinearGradient
          colors={cta.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text maxFontSizeMultiplier={1.35} style={styles.label}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: cta.shadow,
    shadowOpacity: 1,
    shadowRadius: 21,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    borderRadius: radius.pill,
  },
  button: {
    minHeight: 56,
    paddingHorizontal: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: { alignSelf: 'stretch', width: '100%' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  label: {
    fontFamily: font.bodyStrong,
    fontSize: 15,
    color: ink.high,
  },
});
