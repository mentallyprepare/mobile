import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useMeShared } from '../src/api/me-provider';
import { isVerificationRateLimit, resendVerification } from '../src/api/verification';
import { ApiError } from '../src/api';
import { brand, radius, space, type } from '../src/design';

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
        setMessage('Already verified. Reloading your account.');
        await reload();
      } else {
        setMessage('A fresh verification email is on its way.');
      }
    } catch (err) {
      if (isVerificationRateLimit(err)) {
        setError(
          err instanceof ApiError && typeof err.message === 'string'
            ? err.message
            : 'Please wait a minute before requesting another verification email.',
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
      <Stack.Screen options={{ title: 'Verify email' }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backLabel}>← back</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>EMAIL VERIFICATION</Text>
          <Text style={styles.title}>
            {verified ? 'Your email is verified.' : 'Confirm your email.'}
          </Text>

          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>ACCOUNT EMAIL</Text>
            <Text style={styles.email} selectable>
              {email || '—'}
            </Text>
            <Text style={styles.status}>
              {verified ? '● verified' : '○ awaiting confirmation'}
            </Text>
          </View>

          {!verified ? (
            <>
              <Text style={styles.body}>
                We&apos;ll send a link to your email. Clicking it opens the
                Mentally Prepare web app in your browser and confirms the
                account. Then you can come back here — everything on this
                device stays as it is.
              </Text>

              <Pressable
                onPress={() => void resend()}
                disabled={sending}
                accessibilityRole="button"
                accessibilityLabel="Resend verification email"
                accessibilityState={{ disabled: sending }}
                style={({ pressed }) => [
                  styles.primary,
                  sending && styles.primaryDim,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryLabel}>
                  {sending ? 'sending…' : 'send verification email'}
                </Text>
                {sending ? <ActivityIndicator color={brand.void} style={styles.spinner} /> : null}
              </Pressable>
            </>
          ) : (
            <Text style={styles.body}>
              You can close this screen. Verification helps with password
              resets and recovery if you ever lose access.
            </Text>
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
  return 'Something went wrong. Try again in a moment.';
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
