import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import { ink, font, sky, moon } from '../../src/theme';

// Tonight. Static layout — copy is from the approved prototype.
// TODO: night number, presence state and prompt come from /api/me.
export default function Tonight() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>NIGHT 9</Text>

        <View style={styles.moonWrap}>
          <Moon present size={56} />
        </View>
        <Text style={styles.presence}>your match sealed something for you.</Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: sky.late },
  content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  eyebrow: {
    fontFamily: font.body,
    fontSize: 11,
    letterSpacing: 2.4,
    color: ink.mid,
  },
  moonWrap: { marginTop: 22 },
  presence: {
    marginTop: 18,
    fontFamily: font.body,
    fontSize: 14,
    color: moon.present,
  },
  card: {
    marginTop: 40,
    borderRadius: 20,
    padding: 22,
    backgroundColor: 'rgba(239,234,255,0.035)',
    borderWidth: 1,
    borderColor: ink.line,
  },
  prompt: {
    fontFamily: font.displayItalic,
    fontSize: 30,
    lineHeight: 38,
    color: ink.high,
  },
  input: {
    marginTop: 26,
    minHeight: 120,
    fontFamily: font.displayItalic,
    fontSize: 19,
    color: ink.high,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  sealBtn: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(168,155,240,0.22)',
  },
  sealLabel: { fontFamily: font.body, fontSize: 14, color: ink.high },
});
