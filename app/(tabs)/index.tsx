import { useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import PrimaryButton from '../../src/components/PrimaryButton';
import { ink, font, moon, layout } from '../../src/theme';
import { arcLabel } from '../../src/arc';
import { getTonight, type TonightData } from '../../src/backend/ritual';
import { saveDraft, sealEntry } from '../../src/backend/writing';

export default function Tonight() {
  const [tonight, setTonight] = useState<TonightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [draftId, setDraftId] = useState(() => Crypto.randomUUID());
  const [sealKey, setSealKey] = useState(() => Crypto.randomUUID());
  const [serverRevision, setServerRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sealedTonight, setSealedTonight] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getTonight()
      .then((data) => { if (active) setTonight(data); })
      .catch(() => { if (active) setError('could not load tonight. try again in a moment.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function onSeal() {
    if (!tonight || !draft.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const saved = await saveDraft({
        draftId,
        ritualId: tonight.ritualId,
        night: tonight.night,
        content: draft.trim(),
        clientRevision: 1,
        expectedServerRevision: serverRevision,
      });
      setServerRevision(saved.server_revision);
      await sealEntry(draftId, sealKey);
      setDraft('');
      setDraftId(Crypto.randomUUID());
      setSealKey(Crypto.randomUUID());
      setServerRevision(0);
      setSealedTonight(true);
    } catch {
      setError('could not seal this yet. your words are still here.');
    } finally {
      setBusy(false);
    }
  }

  const night = tonight?.night;
  const canSeal = Boolean(tonight && draft.trim() && !busy);

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>
            {loading ? <ActivityIndicator color={moon.present} style={styles.loader} /> : (
              <>
                {night ? <Text style={styles.eyebrow}>{arcLabel(night)}</Text> : null}
                <View style={styles.moonWrap}><Moon present={tonight?.partnerHasSealed ?? false} /></View>
                <Text style={[styles.presence, !tonight?.partnerHasSealed && styles.presenceQuiet]}>
                  {!tonight
                    ? 'still finding someone for you.'
                    : tonight.partnerHasSealed
                      ? 'your match sealed something tonight.'
                      : "your match hasn't written yet."}
                </Text>
                <Card style={styles.card}>
                  {sealedTonight ? (
                    <>
                      <Text style={styles.prompt}>tonight is sealed.</Text>
                      <Text style={styles.sealedNote}>your words remain private.</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.prompt}>{tonight?.prompt || 'tonight will begin when your match is ready.'}</Text>
                      <TextInput
                        style={styles.input}
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="one small sentence is enough..."
                        placeholderTextColor={ink.low}
                        multiline
                        textAlignVertical="top"
                        editable={Boolean(tonight) && !busy}
                        maxLength={10000}
                      />
                      {error ? <Text style={styles.error}>{error}</Text> : null}
                      <View style={styles.actions}>
                        <PrimaryButton label={busy ? 'sealing…' : 'seal it'} onPress={onSeal} disabled={!canSeal} />
                      </View>
                    </>
                  )}
                </Card>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, screen: { flex: 1 }, scroll: { paddingBottom: 56 },
  column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingTop: 48 },
  loader: { marginTop: 80 },
  eyebrow: { fontFamily: font.body, fontSize: 12, letterSpacing: 0.6, color: ink.mid },
  moonWrap: { marginTop: 40 },
  presence: { marginTop: 24, fontFamily: font.body, fontSize: 14.5, lineHeight: 22, color: moon.present },
  presenceQuiet: { color: ink.mid },
  card: { marginTop: 46, padding: 26 },
  prompt: { fontFamily: font.displayItalic, fontSize: 33, lineHeight: 42, color: ink.high },
  sealedNote: { marginTop: 18, fontFamily: font.body, fontSize: 14, lineHeight: 22, color: ink.mid },
  input: { marginTop: 30, minHeight: 132, fontFamily: font.displayItalic, fontSize: 20, lineHeight: 30, color: ink.high },
  error: { marginTop: 16, fontFamily: font.body, fontSize: 13, lineHeight: 20, color: '#E8A0B4' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
});
