import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import { ink, font, sky, moon, surface, layout } from '../../src/theme';
import { arcLabel } from '../../src/arc';

// Tonight. Copy is from the approved prototype.
// TODO: night number, presence state and prompt come from /api/me;
// the room-presence counts come from the silent-room presence endpoint.
const NIGHT = 9;

export default function Tonight() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <Text style={styles.eyebrow}>{arcLabel(NIGHT)}</Text>

          <View style={styles.moonWrap}>
            <Moon present />
          </View>
          <Text style={styles.presence}>your match sealed something for you.</Text>
          <Text style={styles.roomPresence}>3 people wrote tonight. 1 is still here.</Text>

          <View style={styles.card}>
            <Text style={styles.prompt}>what did you not say out loud today?</Text>
            <TextInput
              style={styles.input}
              placeholder="one small sentence is enough..."
              placeholderTextColor={ink.low}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.actions}>
              <Pressable style={styles.sealBtn}>
                <Text style={styles.sealLabel}>seal it</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sky.late },
  scroll: { paddingBottom: 56 },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: 52,
  },
  eyebrow: {
    fontFamily: font.body,
    fontSize: 12,
    letterSpacing: 0.6,
    color: ink.mid,
  },
  moonWrap: { marginTop: 44 },
  presence: {
    marginTop: 26,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 21,
    color: moon.present,
  },
  // Ambient, one step quieter than the match signal above it.
  roomPresence: {
    marginTop: 10,
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 20,
    color: ink.faint,
  },
  card: {
    marginTop: 56,
    borderRadius: 24,
    padding: 26,
    backgroundColor: surface.fill,
    borderWidth: 1,
    borderColor: surface.border,
  },
  prompt: {
    fontFamily: font.displayItalic,
    fontSize: 33,
    lineHeight: 42,
    color: ink.high,
  },
  input: {
    marginTop: 32,
    minHeight: 140,
    fontFamily: font.displayItalic,
    fontSize: 20,
    lineHeight: 30,
    color: ink.high,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  sealBtn: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(168,155,240,0.18)',
  },
  sealLabel: { fontFamily: font.body, fontSize: 14, color: ink.high },
});
