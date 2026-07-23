import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import PrimaryButton from '../../src/components/PrimaryButton';
import { ink, font, moon, layout } from '../../src/theme';
import { arcLabel } from '../../src/arc';
import { useMeShared } from '../../src/api/me-provider';
import { sealEntry } from '../../src/api/entries';
import { ApiError } from '../../src/api';

/**
 * Rooms tab — the ritual. Living Night is preserved inside the Room. When no
 * Room is active, the tab shows a truthful "not yet" state. The ritual writing
 * lives here now rather than as its own primary tab; the shell around it is
 * Daylight.
 */
export default function Rooms() {
  const { data, loading, reload } = useMeShared();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.root}>
        <NightBackground />
        <SafeAreaView style={styles.screen} edges={['top']}>
          <ActivityIndicator color={moon.present} style={{ marginTop: 80 }} />
        </SafeAreaView>
      </View>
    );
  }

  const match = data?.match ?? null;

  if (!match) {
    return (
      <View style={styles.root}>
        <NightBackground />
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.column}>
            <Moon />
            <Text style={styles.emptyTitle}>no room open.</Text>
            <Text style={styles.emptyBody}>
              once someone crosses over with you into the 21 nights, the room
              lives here.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const night = match.day;
  const prompt = match.currentPrompt;
  const partnerSealed = data?.partnerStatus?.partnerHasWrittenToday ?? false;
  const hasPartner = data?.partnerStatus?.hasPartner ?? false;
  const sealedTonight = !!data?.entries?.some((e) => e.day === night);

  async function onSeal() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await sealEntry({ text: draft.trim(), selectedPrompt: prompt });
      setDraft('');
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'could not reach the server. your words are still here.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.column}>
            <Text style={styles.eyebrow}>{arcLabel(night)}</Text>
            <View style={styles.moonWrap}>
              <Moon present={partnerSealed} />
            </View>

            {hasPartner ? (
              <Text style={[styles.presence, !partnerSealed && styles.presenceQuiet]}>
                {partnerSealed
                  ? 'your match sealed something for you.'
                  : "your match hasn't written yet."}
              </Text>
            ) : (
              <Text style={[styles.presence, styles.presenceQuiet]}>
                still finding someone for you.
              </Text>
            )}

            <Card style={styles.card}>
              {sealedTonight ? (
                <>
                  <Text style={styles.prompt}>tonight is sealed.</Text>
                  <Text style={styles.sealedNote}>their note opens after midnight.</Text>
                </>
              ) : (
                <>
                  <Text style={styles.prompt}>{prompt}</Text>
                  <TextInput
                    style={styles.input}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="one small sentence is enough..."
                    placeholderTextColor={ink.low}
                    multiline
                    textAlignVertical="top"
                    editable={!busy}
                    maxLength={5000}
                    accessibilityLabel="Tonight's note"
                  />
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <View style={styles.actions}>
                    <PrimaryButton
                      label={busy ? 'sealing…' : 'seal it'}
                      onPress={onSeal}
                      disabled={!draft.trim() || busy}
                    />
                  </View>
                </>
              )}
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
  scroll: { paddingBottom: 100 },
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
  presenceQuiet: { color: ink.mid },
  card: { marginTop: 46, padding: 26 },
  prompt: {
    fontFamily: font.displayItalic,
    fontSize: 33,
    lineHeight: 42,
    color: ink.high,
  },
  sealedNote: {
    marginTop: 18,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 22,
    color: ink.mid,
  },
  input: {
    marginTop: 30,
    minHeight: 132,
    fontFamily: font.displayItalic,
    fontSize: 20,
    lineHeight: 30,
    color: ink.high,
  },
  error: {
    marginTop: 16,
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#E8A0B4',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  emptyTitle: {
    marginTop: 40,
    fontFamily: font.displayItalic,
    fontSize: 32,
    color: ink.high,
  },
  emptyBody: {
    marginTop: 18,
    fontFamily: font.body,
    fontSize: 14.5,
    lineHeight: 23,
    color: ink.mid,
  },
});
