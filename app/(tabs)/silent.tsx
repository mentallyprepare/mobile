import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ink, font, sky, star } from '../../src/theme';

// Placeholder content until /api/silent is wired.
const LINES = [
  { text: 'i told my therapist i was doing fine and immediately felt like a fraud', count: 12, mine: false },
  { text: "still haven't opened that email from three weeks ago", count: 5, mine: true },
  { text: 'i think i miss a version of someone who never really existed', count: 8, mine: false },
];

export default function SilentRoom() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>the silent room.</Text>
        <Text style={styles.sub}>43 awake here tonight. one line, no replies.</Text>

        {LINES.map((line) => (
          <View key={line.text} style={styles.card}>
            <Text style={styles.lineText}>{line.text}</Text>
            <View style={styles.meta}>
              <View style={[styles.dot, line.mine && styles.dotOn]} />
              <Text style={styles.count}>{line.count}</Text>
            </View>
          </View>
        ))}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="one line. 200 characters."
            placeholderTextColor={ink.low}
            maxLength={200}
          />
          <Pressable style={styles.addBtn}>
            <Text style={styles.addLabel}>add</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sky.late },
  content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  title: {
    fontFamily: font.displayItalic,
    fontSize: 30,
    color: ink.high,
  },
  sub: { marginTop: 10, fontFamily: font.body, fontSize: 13, color: ink.mid },
  card: {
    marginTop: 18,
    borderRadius: 18,
    padding: 20,
    backgroundColor: 'rgba(239,234,255,0.035)',
    borderWidth: 1,
    borderColor: ink.line,
  },
  lineText: {
    fontFamily: font.displayItalic,
    fontSize: 19,
    lineHeight: 27,
    color: ink.high,
  },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(239,234,255,0.28)',
  },
  dotOn: { backgroundColor: star.theirs },
  count: { fontFamily: font.body, fontSize: 12, color: ink.mid },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ink.line,
    backgroundColor: 'rgba(239,234,255,0.03)',
    fontFamily: font.body,
    fontSize: 14,
    color: ink.high,
  },
  addBtn: { paddingHorizontal: 20, paddingVertical: 15 },
  addLabel: { fontFamily: font.body, fontSize: 14, color: ink.mid },
});
