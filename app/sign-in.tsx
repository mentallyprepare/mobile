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
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthPrimaryButton from '../src/components/auth/AuthPrimaryButton';
import AppBackdrop from '../src/components/app/AppBackdrop';
import OrbitArtifact from '../src/components/brand/OrbitArtifact';
import { useSession } from '../src/session';
import { ApiError } from '../src/api';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';
import { brand, layout, radius, space, type } from '../src/design';

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useSession();
  // Subscribe to language changes so a picker choice re-renders this screen
  // with the new copy immediately, not on next navigation.
  useLanguage();
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
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not reach the server. Check your connection and try again.',
      );
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
              <View style={styles.topbar}>
                <View>
                  <Text style={styles.wordmark}>MENTALLY PREPARE</Text>
                  <Text style={styles.screenLabel}>{t('sign_in.screen_label')}</Text>
                </View>
                <View style={styles.guide}>
                  <OrbitArtifact size={68} />
                </View>
              </View>

              <View style={styles.heading}>
                <Text style={styles.title}>{t('sign_in.title')}</Text>
                <Text style={styles.sub}>{t('sign_in.sub')}</Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>{t('sign_in.email_label')}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError(null);
                  }}
                  placeholder={t('sign_in.email_placeholder')}
                  placeholderTextColor={brand.inkLow}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!busy}
                  accessibilityLabel={t('sign_in.email_a11y')}
                />

                <Text style={[styles.label, styles.labelSpaced]}>{t('sign_in.password_label')}</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={brand.inkLow}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="password"
                  editable={!busy}
                  onSubmitEditing={onSubmit}
                  returnKeyType="go"
                  accessibilityLabel={t('sign_in.password_a11y')}
                />

                <Pressable
                  onPress={() => router.push('/forgot-password')}
                  accessibilityRole="button"
                  accessibilityLabel={t('sign_in.forgot_a11y')}
                  style={styles.forgot}
                >
                  <Text style={styles.forgotLabel}>{t('sign_in.forgot')}</Text>
                </Pressable>

                {error ? (
                  <View style={styles.errorBox}>
                    <View style={styles.errorDot} />
                    <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.actions}>
                  <AuthPrimaryButton
                    label={busy ? t('sign_in.submit_busy') : t('sign_in.submit')}
                    onPress={onSubmit}
                    disabled={!canSubmit}
                  />
                </View>
              </View>

              <Pressable
                onPress={() => router.push('/sign-up')}
                accessibilityRole="button"
                accessibilityLabel={t('sign_in.create_a11y')}
                style={({ pressed }) => [
                  styles.createAccount,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.createEyebrow}>{t('sign_in.create_eyebrow')}</Text>
                <Text style={styles.createLabel}>{t('sign_in.create_label')}</Text>
                <Text style={styles.createArrow}>→</Text>
              </Pressable>

              {__DEV__ ? (
                <Pressable
                  onPress={() => router.push('/daily-preview')}
                  accessibilityRole="button"
                  accessibilityLabel="Preview daily edition interactions"
                  style={({ pressed }) => [styles.preview, pressed && styles.pressed]}
                >
                  <Text style={styles.previewEyebrow}>DEVELOPMENT PREVIEW</Text>
                  <Text style={styles.previewLabel}>try the daily interactions</Text>
                  <Text style={styles.createArrow}>→</Text>
                </Pressable>
              ) : null}

              <Text style={styles.privacyNote}>{t('sign_in.privacy_note')}</Text>

              <Pressable
                onPress={() => router.push('/support' as Href)}
                accessibilityRole="button"
                accessibilityLabel={t('sign_in.support_a11y')}
                accessibilityHint={t('sign_in.support_hint')}
                hitSlop={12}
                style={styles.supportLink}
              >
                <Text style={styles.supportLabel}>{t('sign_in.support_link')}</Text>
              </Pressable>
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
    minHeight: '100%',
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  topbar: {
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    ...type.eyebrow,
    color: brand.ink,
    letterSpacing: 2.2,
    fontSize: 10,
  },
  screenLabel: {
    ...type.eyebrow,
    color: brand.inkLow,
    letterSpacing: 1.1,
    fontSize: 8,
    marginTop: 7,
  },
  guide: { width: 68, height: 68 },
  heading: { marginTop: space.lg },
  title: {
    ...type.displayItalic,
    color: brand.ink,
    fontSize: 46,
    lineHeight: 50,
  },
  sub: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.sm,
  },
  form: {
    marginTop: space.xxl,
    padding: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  label: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  labelSpaced: { marginTop: space.lg },
  input: {
    height: 56,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
    ...type.body,
    fontSize: 15,
    color: brand.ink,
  },
  forgot: { alignSelf: 'flex-end', marginTop: space.md, paddingVertical: 4 },
  forgotLabel: { ...type.bodySmall, color: brand.rose },
  errorBox: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(235,180,194,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(235,180,194,0.22)',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: brand.rose,
    marginTop: 6,
    marginRight: 9,
  },
  error: {
    flex: 1,
    ...type.bodySmall,
    color: brand.rose,
  },
  actions: { marginTop: space.xl },
  createAccount: {
    minHeight: 72,
    marginTop: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
    justifyContent: 'center',
  },
  createEyebrow: {
    ...type.eyebrow,
    color: brand.inkLow,
    fontSize: 8,
    letterSpacing: 1.1,
  },
  createLabel: {
    ...type.bodyStrong,
    color: brand.ink,
    fontSize: 14,
    marginTop: 3,
  },
  createArrow: {
    position: 'absolute',
    right: space.lg,
    color: brand.gold,
    fontSize: 21,
  },
  privacyNote: {
    ...type.bodySmall,
    color: brand.inkLow,
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  preview: {
    minHeight: 64,
    marginTop: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(236,200,133,0.36)',
    backgroundColor: 'rgba(236,200,133,0.06)',
    justifyContent: 'center',
  },
  previewEyebrow: { ...type.eyebrow, color: brand.gold, fontSize: 8, letterSpacing: 1.1 },
  previewLabel: { ...type.bodyStrong, color: brand.ink, fontSize: 14, marginTop: 3 },
  pressed: { opacity: 0.82 },
  supportLink: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  supportLabel: { ...type.bodySmall, color: brand.inkMid, textDecorationLine: 'underline' },
});
