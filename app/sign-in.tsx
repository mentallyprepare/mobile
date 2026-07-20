import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import NightBackground from '../src/components/NightBackground';
import PrimaryButton from '../src/components/PrimaryButton';
import Moon from '../src/components/Moon';
import { useSession } from '../src/session';
import { ink, font, surface, layout } from '../src/theme';

export default function SignIn() {
  const { requestCode, signIn } = useSession();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canSubmit = email.trim().length > 0 && (!codeSent || code.trim().length >= 6) && !busy;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      if (codeSent) await signIn(email, code);
      else {
        await requestCode(email);
        setCodeSent(true);
      }
    } catch {
      setError('could not complete sign in. check the details and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.column}>
              <Moon present />
              <Text style={styles.title}>welcome back.</Text>
              <Text style={styles.sub}>the night kept your place.</Text>
              <Card style={styles.card}>
                <Text style={styles.label}>email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@college.edu"
                  placeholderTextColor={ink.low}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!busy && !codeSent}
                />
                {codeSent ? (
                  <>
                    <Text style={[styles.label, styles.labelSpaced]}>email code</Text>
                    <TextInput
                      style={styles.input}
                      value={code}
                      onChangeText={setCode}
                      placeholder="six-digit code"
                      placeholderTextColor={ink.low}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      editable={!busy}
                      onSubmitEditing={onSubmit}
                      returnKeyType="go"
                    />
                  </>
                ) : null}
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={styles.actions}>
                  <PrimaryButton
                    label={busy ? 'one moment…' : codeSent ? 'enter the night' : 'send email code'}
                    onPress={onSubmit}
                    disabled={!canSubmit}
                    block
                  />
                </View>
              </Card>
              <Text style={styles.footnote}>no password. the code expires after a short time.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter },
  title: { marginTop: 30, fontFamily: font.displayItalic, fontSize: 36, color: ink.high },
  sub: { marginTop: 12, fontFamily: font.body, fontSize: 14, lineHeight: 22, color: ink.mid },
  card: { marginTop: 34, padding: 24 },
  label: { fontFamily: font.body, fontSize: 11, letterSpacing: 1.6, color: ink.mid, marginBottom: 8 },
  labelSpaced: { marginTop: 20 },
  input: { height: 50, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: surface.border, backgroundColor: 'rgba(5,3,17,0.45)', fontFamily: font.body, fontSize: 15, color: ink.high },
  error: { marginTop: 16, fontFamily: font.body, fontSize: 13, lineHeight: 20, color: '#E8A0B4' },
  actions: { marginTop: 24 },
  footnote: { marginTop: 26, fontFamily: font.body, fontSize: 12.5, lineHeight: 20, color: ink.faint, textAlign: 'center' },
});
