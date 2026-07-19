import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import { ink, font, star, surface, layout } from '../../src/theme';

// Placeholder content until /api/silent is wired.
const LINES = [
  { text: 'i told my therapist i was doing fine and immediately felt like a fraud', count: 12, mine: false },
  { text: "still haven't opened that email from three weeks ago", count: 5, mine: true },
  { text: 'i think i miss a version of someone who never really existed', count: 8, mine: false },
];

export default function SilentRoom() {
  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <Text style={styles.title}>the silent room.</Text>
          <Text style={styles.sub}>43 awake here tonight. one line, no replies.</Text>

          {LINES.map((line) => (
            <Card key={line.text} style={styles.card}>
              <Text style={styles.lineText}>{line.text}</Text>
              <View style={styles.meta}>
                <View style={[styles.dot, line.mine && styles.dotOn]} />
                <Text style={styles.count}>{line.count}</Text>
              </View>
            </Card>
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
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  scroll: { paddingBottom: 56 },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: 52,
  },
  title: {
    fontFamily: font.displayItalic,
    fontSize: 33,
    color: ink.high,
  },
  sub: { marginTop: 14, fontFamily: font.body, fontSize: 13, lineHeight: 20, color: ink.mid },
  card: { marginTop: 20, padding: 24 },
  lineText: {
    fontFamily: font.displayItalic,
    fontSize: 21,
    lineHeight: 31,
    color: ink.high,
  },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 10 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  dotOn: { backgroundColor: star.theirs },
  count: { fontFamily: font.body, fontSize: 12, color: ink.mid },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 36 },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: surface.fill,
    fontFamily: font.body,
    fontSize: 14,
    color: ink.high,
  },
  addBtn: { paddingHorizontal: 18, paddingVertical: 16 },
  addLabel: { fontFamily: font.body, fontSize: 14, color: ink.mid },
});
