import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import NightBackground from '../src/components/NightBackground';
import PrimaryButton from '../src/components/PrimaryButton';
import { completeInitialAccountSetup } from '../src/backend/accountSetup';
import { useAccountSetup } from '../src/backend/AccountSetupProvider';
import { getOnboardingProgress, saveOnboardingProgress } from '../src/backend/onboarding';
import { font, ink, layout, surface } from '../src/theme';

export default function AccountOnboarding() {
  const router = useRouter();
  const { markComplete } = useAccountSetup();
  const [name, setName] = useState('');
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = name.trim().length >= 2 && age && terms && privacy && !busy;

  useEffect(() => {
    let active = true;
    getOnboardingProgress().then((progress) => {
      if (!active || !progress || typeof progress.draftData !== 'object' || Array.isArray(progress.draftData) || progress.draftData === null) return;
      const draftName = progress.draftData.displayName;
      if (typeof draftName === 'string') setName(draftName);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const saveDraft = async () => {
    if (name.trim().length < 2) return;
    try {
      await saveOnboardingProgress({ currentStep: 'display_identity', completedSteps: ['account', 'age_confirmation'], draftData: { displayName: name.trim() }, completedAt: null });
      setSaved(true);
    } catch { setSaved(false); }
  };

  const finish = async () => {
    if (!ready) return;
    setBusy(true); setError(null);
    try {
      await completeInitialAccountSetup({ anonymousName: name, ageConfirmed: age, termsAccepted: terms, privacyAccepted: privacy });
      markComplete();
      router.replace('/');
    } catch { setError('Setup could not be completed. Your private account was not opened.'); }
    finally { setBusy(false); }
  };

  return <View style={styles.root}><NightBackground /><SafeAreaView style={styles.screen}><KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><View style={styles.column}>
    <Text style={styles.step}>PRIVATE ACCOUNT SETUP</Text><Text style={styles.title}>a name for this space.</Text><Text style={styles.sub}>Use a name you are comfortable showing later. Your profile and discovery remain private.</Text>
    <Card style={styles.card}><Text style={styles.label}>DISPLAY NAME</Text><TextInput value={name} onChangeText={(value) => { setName(value); setSaved(false); }} onBlur={() => void saveDraft()} style={styles.input} placeholder="2–40 characters" placeholderTextColor={ink.low} maxLength={40} />
      <Check checked={age} setChecked={setAge} text="I confirm I am 18 or older." /><Check checked={terms} setChecked={setTerms} text="I agree to the terms." /><Check checked={privacy} setChecked={setPrivacy} text="I have read and accept the privacy notice." />
      {saved ? <Text style={styles.saved}>Draft name saved privately.</Text> : null}{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<View style={styles.action}><PrimaryButton block disabled={!ready} onPress={finish} label={busy ? 'saving…' : 'continue privately'} /></View>
    </Card><Text style={styles.note}>This completes account setup only. Taste, emotional prompts, archetype, safety choices, and discovery remain separate steps.</Text>
  </View></ScrollView></KeyboardAvoidingView></SafeAreaView></View>;
}

function Check({ checked, setChecked, text }: { checked: boolean; setChecked: (value: boolean) => void; text: string }) {
  return <Text onPress={() => setChecked(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} style={styles.check}>{checked ? '✓  ' : '○  '}{text}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, screen: { flex: 1 }, scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }, column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter },
  step: { fontFamily: font.body, fontSize: 10, letterSpacing: 2, color: ink.mid }, title: { marginTop: 14, fontFamily: font.displayItalic, fontSize: 36, color: ink.high }, sub: { marginTop: 12, fontFamily: font.body, fontSize: 13.5, lineHeight: 22, color: ink.mid },
  card: { marginTop: 28, padding: 24 }, label: { fontFamily: font.body, fontSize: 10, letterSpacing: 1.6, color: ink.mid }, input: { height: 52, marginTop: 10, marginBottom: 20, paddingHorizontal: 15, borderRadius: 14, borderWidth: 1, borderColor: surface.border, color: ink.high, fontFamily: font.body, fontSize: 15 },
  check: { marginTop: 14, fontFamily: font.body, fontSize: 13, lineHeight: 21, color: ink.high }, saved: { marginTop: 16, fontFamily: font.body, fontSize: 11.5, color: ink.mid }, error: { marginTop: 16, fontFamily: font.body, fontSize: 12.5, lineHeight: 20, color: '#F2A8B8' }, action: { marginTop: 24 }, note: { marginTop: 20, fontFamily: font.body, fontSize: 11.5, lineHeight: 19, color: ink.faint },
});
