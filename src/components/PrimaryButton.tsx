import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cta, font, ink } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
};

/**
 * The one saturated element on a screen. Carries the web app's rose-to-purple
 * gradient and deep shadow — a translucent pill reads as disabled.
 */
export default function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <View style={styles.shadow}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        <LinearGradient
          colors={cta.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.label}>{label}</Text>
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
    borderRadius: 999,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  label: {
    fontFamily: font.bodyStrong,
    fontSize: 15,
    color: ink.high,
  },
});
