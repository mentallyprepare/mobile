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
import DaylightCard from '../src/components/DaylightCard';
import DaylightButton from '../src/components/DaylightButton';
import Illustration from '../src/components/Illustration';
import { useSession } from '../src/session';
import { ApiError } from '../src/api';
import { daylight, layout, space, type } from '../src/design';

/**
 * Sign-in — Daylight. The app's front door is the finding phase, so it lives
 * in Daylight, not inside the ritual's dark palette. See
 * docs/the-version.md and docs/design-daylight-world.md.
 */
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
      // Root navigator picks up the session flip and routes on.
    } catch (err) {
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
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.column}>
              <Illustration slot="home-hero" size={92} />
              <Text style={styles.title}>welcome back.</Text>
              <Text style={styles.sub}>the night kept your place.</Text>

              <DaylightCard style={styles.card}>
                <Text style={styles.label}>email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@college.edu"
                  placeholderTextColor={daylight.inkLow}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!busy}
                  accessibilityLabel="Email"
                />

                <Text style={[styles.label, styles.labelSpaced]}>password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={daylight.inkLow}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  editable={!busy}
                  onSubmitEditing={onSubmit}
                  returnKeyType="go"
                  accessibilityLabel="Password"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.actions}>
                  <DaylightButton
                    label={busy ? 'signing in…' : 'sign in'}
                    onPress={onSubmit}
                    disabled={!canSubmit}
                    block
                  />
                </View>
              </DaylightCard>

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
  root: { flex: 1, backgroundColor: daylight.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: space.huge },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  title: {
    marginTop: space.xl,
    ...type.displayItalic,
    fontSize: 38,
    lineHeight: 44,
    color: daylight.ink,
  },
  sub: {
    marginTop: space.md,
    ...type.body,
    color: daylight.inkMid,
  },
  card: { marginTop: space.xl, padding: space.xl },
  label: {
    ...type.eyebrow,
    color: daylight.inkMid,
    marginBottom: 8,
  },
  labelSpaced: { marginTop: space.lg },
  input: {
    height: 50,
    paddingHorizontal: space.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    ...type.body,
    fontSize: 15,
    color: daylight.ink,
  },
  error: {
    marginTop: space.lg,
    ...type.bodySmall,
    color: daylight.accentRose,
  },
  actions: { marginTop: space.xl },
  footnote: {
    marginTop: space.xl,
    ...type.bodySmall,
    color: daylight.inkLow,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
