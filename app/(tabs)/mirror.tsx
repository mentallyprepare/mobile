import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import { ink, font, sky } from '../../src/theme';

// Placeholder shelf until the shelf_items schema is signed off and wired.
const YOUR_SHELF = [
  { kind: 'song', title: 'Self Control', detail: 'Frank Ocean' },
  { kind: 'song', title: 'Liability', detail: 'Frank Ocean' },
  { kind: 'book', title: 'The Bell Jar', detail: null },
  { kind: 'film', title: 'Past Lives', detail: null },
];

export default function Mirror() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Moon size={34} />
        <Text style={styles.archetype}>the mirror</Text>
        <Text style={styles.archetypeLine}>you see what others can&apos;t admit, even in yourself</Text>

        <Text style={styles.sectionLabel}>YOUR SHELF</Text>
        {YOUR_SHELF.map((item) => (
          <View key={item.title} style={styles.row}>
            {item.kind === 'song' ? (
              <View style={styles.art} />
            ) : (
              <Text style={styles.kind}>{item.kind.toUpperCase()}</Text>
            )}
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              {item.detail ? <Text style={styles.rowDetail}>{item.detail}</Text> : null}
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>YOUR MATCH · THE PROTECTOR</Text>
        <View style={styles.matchMoon}>
          <Moon present size={30} />
        </View>
        <Text style={styles.matchLine}>someone from another city, night 9 with you</Text>

        <View style={[styles.row, styles.matchRow]}>
          <View style={styles.art} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitleMatch}>the night will always win</Text>
            <Text style={styles.rowDetail}>Frank Ocean</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sky.late },
  content: { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 40 },
  archetype: {
    marginTop: 22,
    fontFamily: font.displayItalic,
    fontSize: 34,
    color: ink.high,
  },
  archetypeLine: {
    marginTop: 10,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 22,
    color: ink.mid,
    maxWidth: 300,
  },
  sectionLabel: {
    marginTop: 40,
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.8,
    color: ink.mid,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ink.line,
    backgroundColor: 'rgba(239,234,255,0.03)',
  },
  matchRow: { backgroundColor: 'rgba(168,155,240,0.06)' },
  art: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: 'rgba(239,234,255,0.08)',
  },
  kind: {
    width: 44,
    fontFamily: font.body,
    fontSize: 9,
    letterSpacing: 1.4,
    color: ink.mid,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: font.body, fontSize: 15, color: ink.high },
  rowTitleMatch: { fontFamily: font.body, fontSize: 15, color: '#A89BF0' },
  rowDetail: { marginTop: 3, fontFamily: font.body, fontSize: 12.5, color: ink.mid },
  divider: { height: 1, backgroundColor: ink.line, marginTop: 40 },
  matchMoon: { marginTop: 20 },
  matchLine: {
    marginTop: 16,
    fontFamily: font.body,
    fontSize: 15,
    lineHeight: 23,
    color: ink.high,
    maxWidth: 280,
  },
});
