import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DaylightButton from '../src/components/DaylightButton';
import DaylightCard from '../src/components/DaylightCard';
import AuthPrimaryButton from '../src/components/auth/AuthPrimaryButton';
import AppBackdrop from '../src/components/app/AppBackdrop';
import OrbitArtifact from '../src/components/brand/OrbitArtifact';
import { requestPasswordReset, resetPassword } from '../src/api/password';
import {
  canRequestPasswordReset,
  normalizeResetCode,
  passwordResetValidation,
} from '../src/auth/password-reset';
import { brand, layout, radius, space, type } from '../src/design';

type Step = 'request' | 'reset' | 'complete';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    if (!canRequestPasswordReset(email) || busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setStep('reset');
    } catch {
      setError('We could not request a code right now. Try again shortly.');
    } finally {
      setBusy(false);
    }
  }

  async function savePassword() {
    const validation = passwordResetValidation({ code, password, confirmation });
    if (validation || busy) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetPassword(normalizeResetCode(code), password);
      setPassword('');
      setConfirmation('');
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The password could not be reset.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <AppBackdrop />
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
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                style={styles.back}
              >
                <Text style={styles.backLabel}>← back</Text>
              </Pressable>

              <View style={styles.topline}>
                <Text style={styles.wordmark}>MENTALLY PREPARE</Text>
                <OrbitArtifact size={62} />
              </View>

              <Text style={styles.eyebrow}>ACCOUNT ACCESS</Text>
              <Text style={styles.title}>
                {step === 'complete' ? 'your password is ready.' : 'find your way back.'}
              </Text>
              <Text style={styles.intro}>
                {step === 'request'
                  ? 'Enter the email connected to your account. We will send a short-lived reset code.'
                  : step === 'reset'
                    ? 'If that account exists, a six-character code is on its way. It expires after 15 minutes.'
                    : 'You can return to sign in with your new password.'}
              </Text>

              <DaylightCard style={styles.card}>
                {step === 'request' ? (
                  <>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      editable={!busy}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      placeholder="you@college.edu"
                      placeholderTextColor={brand.inkLow}
                      accessibilityLabel="Account email"
                      style={styles.input}
                    />
                    <View style={styles.actions}>
                      <AuthPrimaryButton
                        label={busy ? 'requesting code…' : 'send reset code'}
                        onPress={() => void sendCode()}
                        disabled={!canRequestPasswordReset(email) || busy}
                      />
                    </View>
                  </>
                ) : step === 'reset' ? (
                  <>
                    <Text style={styles.label}>RESET CODE</Text>
                    <TextInput
                      value={code}
                      onChangeText={(value) => setCode(value.slice(0, 8))}
                      editable={!busy}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      placeholder="ABC123"
                      placeholderTextColor={brand.inkLow}
                      accessibilityLabel="Six-character reset code"
                      style={[styles.input, styles.code]}
                    />

                    <Text style={[styles.label, styles.labelSpaced]}>NEW PASSWORD</Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      editable={!busy}
                      secureTextEntry
                      textContentType="newPassword"
                      placeholder="at least 8 characters"
                      placeholderTextColor={brand.inkLow}
                      accessibilityLabel="New password"
                      style={styles.input}
                    />

                    <Text style={[styles.label, styles.labelSpaced]}>CONFIRM PASSWORD</Text>
                    <TextInput
                      value={confirmation}
                      onChangeText={setConfirmation}
                      editable={!busy}
                      secureTextEntry
                      textContentType="newPassword"
                      placeholder="repeat new password"
                      placeholderTextColor={brand.inkLow}
                      accessibilityLabel="Confirm new password"
                      style={styles.input}
                    />

                    <View style={styles.actions}>
                      <AuthPrimaryButton
                        label={busy ? 'saving password…' : 'save new password'}
                        onPress={() => void savePassword()}
                        disabled={busy}
                      />
                      <DaylightButton
                        label="request another code"
                        variant="ghost"
                        onPress={() => {
                          setStep('request');
                          setError(null);
                        }}
                        disabled={busy}
                        block
                      />
                    </View>
                  </>
                ) : (
                  <View style={styles.actions}>
                    <AuthPrimaryButton
                      label="return to sign in"
                      onPress={() => router.replace('/sign-in')}
                    />
                  </View>
                )}

                {error ? (
                  <Text accessibilityLiveRegion="polite" style={styles.error}>
                    {error}
                  </Text>
                ) : null}
              </DaylightCard>

              {step !== 'complete' ? (
                <Text style={styles.note}>
                  For privacy, this screen gives the same response whether or not
                  an account exists.
                </Text>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingVertical: space.lg },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  back: { alignSelf: 'flex-start', paddingVertical: 6 },
  backLabel: { ...type.body, fontSize: 13.5, color: 'rgba(248,242,255,0.76)' },
  topline: {
    minHeight: 64,
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    ...type.eyebrow,
    color: 'rgba(248,242,255,0.72)',
    letterSpacing: 2.2,
  },
  eyebrow: {
    marginTop: space.xl,
    ...type.eyebrow,
    letterSpacing: 1.5,
    color: brand.rose,
  },
  title: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 36,
    lineHeight: 42,
    color: brand.ink,
  },
  intro: {
    marginTop: space.md,
    ...type.body,
    lineHeight: 23,
    color: 'rgba(248,242,255,0.72)',
  },
  card: {
    marginTop: space.lg,
    padding: space.lg,
    backgroundColor: brand.card,
    borderColor: brand.line,
    shadowColor: brand.void,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  label: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 9,
    marginBottom: 8,
  },
  labelSpaced: { marginTop: space.lg },
  input: {
    minHeight: 50,
    paddingHorizontal: space.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
    ...type.body,
    fontSize: 15,
    color: brand.ink,
  },
  code: { letterSpacing: 4 },
  actions: { marginTop: space.xl, gap: space.md },
  error: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(235,180,194,0.10)',
    ...type.bodySmall,
    lineHeight: 20,
    color: brand.rose,
  },
  note: {
    marginTop: space.lg,
    ...type.bodySmall,
    color: 'rgba(248,242,255,0.68)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
