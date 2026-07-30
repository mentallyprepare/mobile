import { Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, radius, type } from '../../design';

export default function AuthPrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={disabled && styles.disabled}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [styles.button, pressed && !disabled && styles.pressed]}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { ...type.bodyStrong, fontSize: 14, color: brand.void },
  arrow: { fontSize: 19, color: brand.void },
  disabled: { opacity: 0.38 },
  pressed: { opacity: 0.76 },
});
