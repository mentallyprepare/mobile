import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';
import Illustration from './Illustration';
import { radius, space, type } from '../design';

/** A quiet, atmospheric welcome panel used for first-run and empty states. */
export default function CosmicWelcome({ compact = false }: { compact?: boolean }) {
  return (
    <LinearGradient
      colors={['#25152E', '#4A315E', '#75629A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.panel, compact && styles.compact]}
      accessibilityRole="summary"
      accessibilityLabel="A quiet place to notice what is true for you"
    >
      <View style={styles.art}><Illustration slot="home-hero" size={compact ? 56 : 84} /></View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>MENTALLY PREPARE</Text>
        <Text style={[styles.title, compact && styles.compactTitle]}>make room for what is true.</Text>
        {!compact ? <Text style={styles.body}>A few honest answers are enough to begin.</Text> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  panel: { minHeight: 174, borderRadius: radius.xl, padding: space.xl, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  compact: { minHeight: 112, padding: space.lg },
  art: { marginRight: space.lg },
  copy: { flex: 1 },
  eyebrow: { ...type.eyebrow, color: '#E7E1F8', letterSpacing: 1.4, fontSize: 10 },
  title: { ...type.displayItalic, color: '#FFF', fontSize: 28, lineHeight: 32, marginTop: 8 },
  compactTitle: { fontSize: 22, lineHeight: 26 },
  body: { ...type.bodySmall, color: 'rgba(255,255,255,0.78)', marginTop: 8 },
});
