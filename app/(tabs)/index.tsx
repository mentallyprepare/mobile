import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import PrimaryButton from '../../src/components/PrimaryButton';
import { ink, font, moon, layout } from '../../src/theme';
import { arcLabel } from '../../src/arc';

// Tonight. Copy is from the approved prototype.
// TODO: night number, presence state and prompt come from /api/me;
// the room-presence counts come from the silent-room presence endpoint.
const NIGHT = 9;

export default function Tonight() {
  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>
            <Text style={styles.eyebrow}>{arcLabel(NIGHT)}</Text>

            <View style={styles.moonWrap}>
              <Moon present />
            </View>
            <Text style={styles.presence}>your match sealed something for you.</Text>
            <Text style={styles.roomPresence}>3 people wrote tonight. 1 is still here.</Text>

            <Card style={styles.card}>
              <Text style={styles.prompt}>what did you not say out loud today?</Text>
              <TextInput
                style={styles.input}
                placeholder="one small sentence is enough..."
                placeholderTextColor={ink.low}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.actions}>
                <PrimaryButton label="seal it" />
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
    paddingTop: 48,
  },
  eyebrow: {
    fontFamily: font.body,
    fontSize: 12,
    letterSpacing: 0.6,
    color: ink.mid,
  },
  moonWrap: { marginTop: 40 },
  presence: {
    marginTop: 24,
    fontFamily: font.body,
    fontSize: 14.5,
    lineHeight: 22,
    color: moon.present,
  },
  roomPresence: {
    marginTop: 9,
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 20,
    color: ink.faint,
  },
  card: { marginTop: 46, padding: 26 },
  prompt: {
    fontFamily: font.displayItalic,
    fontSize: 33,
    lineHeight: 42,
    color: ink.high,
  },
  input: {
    marginTop: 30,
    minHeight: 132,
    fontFamily: font.displayItalic,
    fontSize: 20,
    lineHeight: 30,
    color: ink.high,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
});
