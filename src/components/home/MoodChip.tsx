import { Pressable, StyleSheet, Text } from 'react-native';
import { brand, radius, space, type } from '../../design';

export default function MoodChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}, ${selected ? 'selected' : 'not selected'}`}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  selected: {
    borderColor: brand.rose,
    backgroundColor: 'rgba(235,180,194,0.12)',
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  label: { ...type.label, color: brand.inkMid, textTransform: 'lowercase' },
  selectedLabel: { color: brand.ink },
});
