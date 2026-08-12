import { StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';

export default function InsightCard({ text, active }: { text: string; active: boolean }) {
  return (
    <View style={[styles.card, active && styles.active]}>
      <Text style={styles.eyebrow}>{active ? 'A SMALL REFLECTION' : 'CHECK IN QUIETLY'}</Text>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.note}>private on this device · not used for matching</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
  },
  active: { borderColor: 'rgba(235,180,194,0.42)' },
  eyebrow: { ...type.eyebrow, fontSize: 8, color: brand.rose },
  text: { ...type.displayItalic, fontSize: 24, lineHeight: 31, color: brand.ink, marginTop: space.sm },
  note: { ...type.bodySmall, color: brand.inkLow, marginTop: space.md },
});
