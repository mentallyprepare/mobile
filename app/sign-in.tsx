import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import NightBackground from '../src/components/NightBackground';
import PrimaryButton from '../src/components/PrimaryButton';
import Moon from '../src/components/Moon';
import { useSession } from '../src/session';
import { ApiError } from '../src/api';
import { ink, font, surface, layout } from '../src/theme';

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // The root navigator redirects once the session flips.
    } catch (err) {
      // Show the server's own wording where we have it; it is already written
      // in the product's voice and knows why the attempt failed.
      const message =
        err instanceof ApiError
          ? err.message
          : 'could not reach the server. check your connection and try again.';
      setError(message);
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
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
                  editable={!busy}
                />

                <Text style={[styles.label, styles.labelSpaced]}>password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={ink.low}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  editable={!busy}
                  onSubmitEditing={onSubmit}
                  returnKeyType="go"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.actions}>
                  <PrimaryButton
                    label={busy ? 'signing in…' : 'sign in'}
                    onPress={onSubmit}
                    disabled={!canSubmit}
                    block
                  />
                </View>
              </Card>

              <Text style={styles.footnote}>
                new here? create your account on the website — the app is for
                nights you have already started.
              </Text>
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
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  title: {
    marginTop: 30,
    fontFamily: font.displayItalic,
    fontSize: 36,
    color: ink.high,
  },
  sub: {
    marginTop: 12,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 22,
    color: ink.mid,
  },
  card: { marginTop: 34, padding: 24 },
  label: {
    fontFamily: font.body,
    fontSize: 11,
    letterSpacing: 1.6,
    color: ink.mid,
    marginBottom: 8,
  },
  labelSpaced: { marginTop: 20 },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: surface.border,
    backgroundColor: 'rgba(5,3,17,0.45)',
    fontFamily: font.body,
    fontSize: 15,
    color: ink.high,
  },
  error: {
    marginTop: 16,
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#E8A0B4',
  },
  actions: { marginTop: 24 },
  footnote: {
    marginTop: 26,
    fontFamily: font.body,
    fontSize: 12.5,
    lineHeight: 20,
    color: ink.faint,
    textAlign: 'center',
  },
});
