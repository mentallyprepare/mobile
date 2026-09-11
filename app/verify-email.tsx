import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useMeShared } from '../src/api/me-provider';
import { isVerificationRateLimit, resendVerification } from '../src/api/verification';
import { ApiError } from '../src/api';
import { brand, radius, space, type } from '../src/design';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

/**
 * Email verification — asks the server to resend the confirmation link and
 * explains that clicking it opens the web app to complete the flow.
 *
 * The verification link itself (/api/verify-email?token=X) is a server
 * redirect back to the web app, so the mobile client cannot handle the
 * confirmation inline. This screen instead surfaces the current status,
 * offers to resend, and tells the user what happens next.
 */
export default function VerifyEmailScreen() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes
  const { data, reload } = useMeShared();
  const email = data?.user?.email ?? '';
  const verified = !!data?.user?.emailVerified;

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    if (sending || verified) return;
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await resendVerification();
      if (result.verified) {
        setMessage(t('verify_email.flash_already_verified'));
        await reload();
      } else {
        setMessage(t('verify_email.flash_sent'));
      }
    } catch (err) {
      if (isVerificationRateLimit(err)) {
        setError(
          err instanceof ApiError && typeof err.message === 'string'
            ? err.message
            : t('verify_email.error_rate_limit'),
        );
      } else {
        setError(messageFor(err));
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t('verify_email.screen_title') }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('verify_email.back_a11y')}
            hitSlop={12}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backLabel}>{t('verify_email.back')}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>{t('verify_email.kicker')}</Text>
          <Text style={styles.title}>
            {verified
              ? t('verify_email.title_verified')
              : t('verify_email.title_unverified')}
          </Text>

          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>{t('verify_email.email_label')}</Text>
            <Text style={styles.email} selectable>
              {email || '—'}
            </Text>
            <Text style={styles.status}>
              {verified
                ? t('verify_email.status_verified')
                : t('verify_email.status_unverified')}
            </Text>
          </View>

          {!verified ? (
            <>
              <Text style={styles.body}>{t('verify_email.body_unverified')}</Text>

              <Pressable
                onPress={() => void resend()}
                disabled={sending}
                accessibilityRole="button"
                accessibilityLabel={t('verify_email.resend_a11y')}
                accessibilityState={{ disabled: sending }}
                style={({ pressed }) => [
                  styles.primary,
                  sending && styles.primaryDim,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryLabel}>
                  {sending ? t('verify_email.sending') : t('verify_email.send')}
                </Text>
                {sending ? <ActivityIndicator color={brand.void} style={styles.spinner} /> : null}
              </Pressable>
            </>
          ) : (
            <Text style={styles.body}>{t('verify_email.body_verified')}</Text>
          )}

          {message ? (
            <Text accessibilityLiveRegion="polite" style={styles.flash}>
              {message}
            </Text>
          ) : null}
          {error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return t('verify_email.generic_error');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md },
  back: { minHeight: 44, justifyContent: 'center' },
  backLabel: { ...type.body, color: brand.inkMid },
  scroll: { padding: space.lg, paddingBottom: space.huge },
  kicker: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.6, fontSize: 11 },
  title: {
    ...type.displayItalic,
    color: brand.ink,
    fontSize: 26,
    lineHeight: 32,
    marginTop: space.sm,
  },
  emailCard: {
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  emailLabel: { ...type.eyebrow, color: brand.inkMid, letterSpacing: 1.6, fontSize: 10 },
  email: { ...type.bodyStrong, color: brand.ink, marginTop: space.sm, fontSize: 16 },
  status: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs },
  body: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.xl,
    lineHeight: 22,
  },
  primary: {
    minHeight: 52,
    marginTop: space.xl,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  primaryDim: { opacity: 0.7 },
  primaryLabel: { ...type.bodyStrong, color: brand.void, fontSize: 15 },
  spinner: {},
  flash: { ...type.bodySmall, color: brand.rose, marginTop: space.md, textAlign: 'center' },
  error: { ...type.bodySmall, color: brand.danger, marginTop: space.md, textAlign: 'center' },
  pressed: { opacity: 0.78 },
});
