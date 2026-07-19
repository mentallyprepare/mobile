import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import { ink, font, surface, layout } from '../../src/theme';

// Placeholder shelf until the shelf_items schema is signed off and wired.
const YOUR_SHELF = [
  { kind: 'song', title: 'Self Control', detail: 'Frank Ocean' },
  { kind: 'song', title: 'Liability', detail: 'Frank Ocean' },
  { kind: 'book', title: 'The Bell Jar', detail: null },
  { kind: 'film', title: 'Past Lives', detail: null },
];

export default function Mirror() {
  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.column}>
            <Moon size={30} />
            <Text style={styles.archetype}>the mirror</Text>
            <Text style={styles.archetypeLine}>
              you see what others can&apos;t admit, even in yourself
            </Text>

            <Text style={styles.sectionLabel}>YOUR SHELF</Text>
            {YOUR_SHELF.map((item) => (
              <Card key={item.title} style={styles.row}>
                {item.kind === 'song' ? (
                  <View style={styles.art} />
                ) : (
                  <Text style={styles.kind}>{item.kind.toUpperCase()}</Text>
                )}
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  {item.detail ? <Text style={styles.rowDetail}>{item.detail}</Text> : null}
                </View>
              </Card>
            ))}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>YOUR MATCH · THE PROTECTOR</Text>
            <View style={styles.matchMoon}>
              <Moon present size={30} />
            </View>
            <Text style={styles.matchLine}>someone from another city, night 9 with you</Text>

            <Card accent style={styles.row}>
              <View style={styles.art} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitleMatch}>the night will always win</Text>
                <Text style={styles.rowDetail}>Frank Ocean</Text>
              </View>
            </Card>
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
    paddingTop: 46,
  },
  archetype: {
    marginTop: 28,
    fontFamily: font.displayItalic,
    fontSize: 38,
    color: ink.high,
  },
  archetypeLine: {
    marginTop: 14,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 23,
    color: ink.mid,
  },
  sectionLabel: {
    marginTop: 48,
    marginBottom: 2,
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 2,
    color: ink.mid,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    padding: 18,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(248,242,255,0.07)',
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
  rowDetail: { marginTop: 4, fontFamily: font.body, fontSize: 12.5, color: ink.mid },
  divider: { height: 1, backgroundColor: surface.border, marginTop: 48 },
  matchMoon: { marginTop: 20 },
  matchLine: {
    marginTop: 18,
    fontFamily: font.body,
    fontSize: 15,
    lineHeight: 24,
    color: ink.high,
  },
});
