import { useState, type ComponentProps } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
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
import { useSession } from '../src/session';
import { ApiError } from '../src/api';
import {
  accountStepError,
  consentStepError,
  GENDER_OPTIONS,
  isExistingAccountStatus,
  MATCH_GENDER_OPTIONS,
  profileStepError,
  type SignUpDraft,
  YEAR_OPTIONS,
} from '../src/auth/sign-up';
import { brand, layout, radius, space, type } from '../src/design';

const EMPTY_DRAFT: SignUpDraft = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  college: '',
  year: '',
  gender: '',
  matchGenderPref: '',
  ageConfirmed: false,
  consentGiven: false,
};

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useSession();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);
  const [busy, setBusy] = useState(false);
  // The pre-account explainer that spells out what "anonymous" means in
  // this app before any name/email/college is asked for. Session-scoped
  // by design: a user who quits mid-signup sees it again next time — it
  // is a gate, not a preference, and never getting to see it is worse
  // than seeing it twice.
  const [explainerAccepted, setExplainerAccepted] = useState(false);

  function update<K extends keyof SignUpDraft>(key: K, value: SignUpDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
    if (key === 'email') setAccountExists(false);
  }

  function continueForward() {
    const validation = step === 1 ? accountStepError(draft) : profileStepError(draft);
    if (validation) return setError(validation);
    setError(null);
    setStep((current) => current + 1);
  }

  async function createAccount() {
    const validation = consentStepError(draft);
    if (validation || busy) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError(null);
    setAccountExists(false);
    try {
      await signUp({
        name: draft.name.trim(),
        email: draft.email.trim().toLowerCase(),
        password: draft.password,
        college: draft.college.trim(),
        year: draft.year,
        gender: draft.gender,
        matchGenderPref: draft.matchGenderPref,
        matchYearPref: 'any',
        ageConfirmed: draft.ageConfirmed,
        consentGiven: draft.consentGiven,
      });
    } catch (err) {
      if (err instanceof ApiError && isExistingAccountStatus(err.status)) {
        setAccountExists(true);
      } else {
        setError(err instanceof Error ? err.message : 'Your account could not be created.');
      }
      setBusy(false);
    }
  }

  if (!explainerAccepted) {
    return (
      <AnonymousExplainer
        onContinue={() => setExplainerAccepted(true)}
        onCancel={() => router.back()}
      />
    );
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
                onPress={() => (step === 1 ? setExplainerAccepted(false) : setStep((value) => value - 1))}
                accessibilityRole="button"
                accessibilityLabel={step === 1 ? 'Back to sign in' : 'Previous step'}
                style={styles.back}
              >
                <Text style={styles.backLabel}>← back</Text>
              </Pressable>

              <View style={styles.topline}>
                <Text style={styles.wordmark}>MENTALLY PREPARE</Text>
                <OrbitArtifact size={62} />
              </View>

              <View style={styles.progress} accessibilityLabel={`Step ${step} of 3`}>
                {[1, 2, 3].map((number) => (
                  <View
                    key={number}
                    style={[styles.progressSegment, number <= step && styles.progressActive]}
                  />
                ))}
              </View>

              <Text style={styles.eyebrow}>CREATE ACCOUNT · {step} OF 3</Text>
              <Text style={styles.title}>
                {step === 1
                  ? 'begin with you.'
                  : step === 2
                    ? 'set your boundaries.'
                    : 'choose with clarity.'}
              </Text>
              <Text style={styles.intro}>
                {step === 1
                  ? 'Create a private account you can return to.'
                  : step === 2
                    ? 'These details help keep introductions relevant and respectful.'
                    : 'Your age and consent are required before an account is created.'}
              </Text>

              <DaylightCard style={styles.card}>
                {step === 1 ? (
                  <>
                    <Field
                      label="YOUR NAME"
                      value={draft.name}
                      onChangeText={(value) => update('name', value)}
                      placeholder="the name we should use"
                      textContentType="name"
                      autoComplete="name"
                    />
                    <Field
                      label="EMAIL"
                      value={draft.email}
                      onChangeText={(value) => update('email', value)}
                      placeholder="you@college.edu"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoComplete="email"
                    />
                    <Field
                      label="PASSWORD"
                      value={draft.password}
                      onChangeText={(value) => update('password', value)}
                      placeholder="at least 8 characters"
                      secureTextEntry
                      textContentType="newPassword"
                      autoComplete="new-password"
                    />
                    <Field
                      label="CONFIRM PASSWORD"
                      value={draft.passwordConfirmation}
                      onChangeText={(value) => update('passwordConfirmation', value)}
                      placeholder="repeat your password"
                      secureTextEntry
                      textContentType="newPassword"
                      autoComplete="new-password"
                    />
                  </>
                ) : step === 2 ? (
                  <>
                    <Field
                      label="COLLEGE OR UNIVERSITY"
                      value={draft.college}
                      onChangeText={(value) => update('college', value)}
                      placeholder="where you study"
                    />
                    <ChoiceGroup
                      label="CURRENT YEAR"
                      options={YEAR_OPTIONS.map((value) => ({ value, label: value }))}
                      value={draft.year}
                      onChange={(value) => update('year', value)}
                    />
                    <ChoiceGroup
                      label="I DESCRIBE MYSELF AS"
                      options={[...GENDER_OPTIONS]}
                      value={draft.gender}
                      onChange={(value) => update('gender', value)}
                    />
                    <ChoiceGroup
                      label="I FEEL COMFORTABLE MEETING"
                      options={[...MATCH_GENDER_OPTIONS]}
                      value={draft.matchGenderPref}
                      onChange={(value) => update('matchGenderPref', value)}
                    />
                  </>
                ) : (
                  <>
                    <ConsentRow
                      checked={draft.ageConfirmed}
                      title="I am 18 or older"
                      body="Mentally Prepare is currently for adults only."
                      onPress={() => update('ageConfirmed', !draft.ageConfirmed)}
                    />
                    <ConsentRow
                      checked={draft.consentGiven}
                      title="I agree to the Terms and Privacy Policy"
                      body="I understand how my account information is used and how I can export or delete it."
                      onPress={() => update('consentGiven', !draft.consentGiven)}
                    />
                    <View style={styles.policyLinks}>
                      <PolicyLink
                        label="read terms"
                        url="https://mymentallyprepare.com/terms"
                      />
                      <PolicyLink
                        label="read privacy policy"
                        url="https://mymentallyprepare.com/privacy"
                      />
                    </View>
                  </>
                )}

                {accountExists ? (
                  <View accessibilityRole="alert" style={styles.accountExists}>
                    <View style={styles.accountExistsIcon}>
                      <Text style={styles.accountExistsIconText}>✦</Text>
                    </View>
                    <View style={styles.accountExistsCopy}>
                      <Text style={styles.accountExistsTitle}>you already have an account.</Text>
                      <Text style={styles.accountExistsBody}>
                        Your details are safe. Sign in, reset the password, or return to
                        step one to use another email.
                      </Text>
                    </View>
                  </View>
                ) : error ? (
                  <Text accessibilityLiveRegion="polite" style={styles.error}>
                    {error}
                  </Text>
                ) : null}

                <View style={styles.actions}>
                  {step < 3 ? (
                    <AuthPrimaryButton label="continue" onPress={continueForward} />
                  ) : accountExists ? (
                    <>
                      <AuthPrimaryButton
                        label="sign in instead"
                        onPress={() => router.replace('/sign-in')}
                      />
                      <DaylightButton
                        label="reset my password"
                        variant="ghost"
                        onPress={() => router.push('/forgot-password')}
                        block
                      />
                      <Pressable
                        onPress={() => {
                          setAccountExists(false);
                          setError(null);
                          setStep(1);
                        }}
                        accessibilityRole="button"
                        style={styles.differentEmail}
                      >
                        <Text style={styles.differentEmailLabel}>use a different email</Text>
                      </Pressable>
                    </>
                  ) : (
                    <AuthPrimaryButton
                      label={busy ? 'creating your account…' : 'create my account'}
                      onPress={() => void createAccount()}
                      disabled={busy}
                    />
                  )}
                </View>
              </DaylightCard>

              <Pressable
                onPress={() => router.replace('/sign-in')}
                accessibilityRole="button"
                style={styles.signIn}
              >
                <Text style={styles.signInLabel}>already have an account? sign in</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Field({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={brand.inkLow}
        accessibilityLabel={label}
        style={styles.input}
      />
    </View>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.choice, selected && styles.choiceSelected]}
            >
              <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ConsentRow({
  checked,
  title,
  body,
  onPress,
}: {
  checked: boolean;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={styles.consent}
    >
      <View style={[styles.checkbox, checked && styles.checkboxSelected]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={styles.consentCopy}>
        <Text style={styles.consentTitle}>{title}</Text>
        <Text style={styles.consentBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

function PolicyLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable onPress={() => void Linking.openURL(url)} accessibilityRole="link">
      <Text style={styles.policyLink}>{label}</Text>
    </Pressable>
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
    minHeight: 58,
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
  progress: { marginTop: space.sm, flexDirection: 'row', gap: space.xs },
  progressSegment: {
    height: 3,
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: brand.inkFaint,
  },
  progressActive: { backgroundColor: brand.rose },
  eyebrow: {
    marginTop: space.lg,
    ...type.eyebrow,
    letterSpacing: 1.4,
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
  field: { marginBottom: space.lg },
  label: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 9,
    marginBottom: 8,
  },
  input: {
    minHeight: 54,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
    ...type.body,
    fontSize: 15,
    color: brand.ink,
  },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  choice: {
    minHeight: 42,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: brand.line,
    justifyContent: 'center',
    backgroundColor: brand.surface,
  },
  choiceSelected: {
    borderColor: brand.purple,
    backgroundColor: 'rgba(137,108,181,0.24)',
  },
  choiceLabel: { ...type.bodySmall, color: brand.inkMid },
  choiceLabelSelected: { color: brand.ink },
  consent: {
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: brand.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { borderColor: brand.purple, backgroundColor: brand.purple },
  checkmark: { color: brand.ink, fontSize: 15 },
  consentCopy: { flex: 1 },
  consentTitle: { ...type.bodyStrong, color: brand.ink },
  consentBody: {
    marginTop: 3,
    ...type.bodySmall,
    lineHeight: 18,
    color: brand.inkMid,
  },
  policyLinks: { marginTop: space.md, flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  policyLink: { ...type.bodySmall, color: brand.rose, textDecorationLine: 'underline' },
  error: { marginTop: space.md, ...type.bodySmall, lineHeight: 20, color: brand.rose },
  accountExists: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(137,108,181,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(137,108,181,0.28)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  accountExistsIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountExistsIconText: { color: brand.ink, fontSize: 17 },
  accountExistsCopy: { flex: 1 },
  accountExistsTitle: { ...type.bodyStrong, fontSize: 15, color: brand.ink },
  accountExistsBody: {
    marginTop: 3,
    ...type.bodySmall,
    lineHeight: 19,
    color: brand.inkMid,
  },
  actions: { marginTop: space.lg, gap: space.md },
  differentEmail: { alignSelf: 'center', paddingVertical: space.sm },
  differentEmailLabel: {
    ...type.bodySmall,
    color: brand.rose,
    textDecorationLine: 'underline',
  },
  signIn: { alignSelf: 'center', marginTop: space.xl, paddingVertical: space.sm },
  signInLabel: { ...type.bodySmall, color: brand.ink },
});

// -------------------------------------------------------------------------
// Anonymous explainer — the gate before name/email/college is collected.
// -------------------------------------------------------------------------

/**
 * Shown once before the sign-up flow starts collecting identifying data.
 * Names the four concrete things "anonymous" means in this app, in the
 * exact terms the landing page uses. Nothing here is legal copy — it is
 * the honest promise the product actually keeps at the server level.
 *
 * "Continue" reveals the existing three-step flow. "Not now" returns to
 * whichever screen sent the user here (sign-in, most commonly).
 */
function AnonymousExplainer({
  onContinue,
  onCancel,
}: {
  onContinue: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={explainerStyles.root}>
      <AppBackdrop />
      <SafeAreaView style={explainerStyles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={explainerStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={explainerStyles.column}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={explainerStyles.back}
            >
              <Text style={explainerStyles.backLabel}>← back</Text>
            </Pressable>

            <View style={explainerStyles.topline}>
              <Text style={explainerStyles.wordmark}>MENTALLY PREPARE</Text>
              <OrbitArtifact size={62} />
            </View>

            <Text style={explainerStyles.kicker} accessibilityRole="header">
              WHAT ANONYMOUS MEANS
            </Text>
            <Text style={explainerStyles.title}>a small, honest promise.</Text>
            <Text style={explainerStyles.intro}>
              Before we ask for your name and email — here is what this app does
              and does not do with them.
            </Text>

            <View style={explainerStyles.promises}>
              <Promise
                index="01"
                title="Your name and email are never shown to another user."
                body="They live on your account for sign-in, password reset, and data export. No profile page displays them."
              />
              <Promise
                index="02"
                title="Your partner never sees who you are."
                body="For 21 nights, you both write anonymously. On Day 21 you both choose separately what to reveal — anywhere from staying anonymous to sharing contact details. If either of you picks anonymous, neither identity crosses."
              />
              <Promise
                index="03"
                title="College and year are used only to match you."
                body="They are not displayed on any profile. We avoid pairing you with someone from the same school unless you consent later."
              />
              <Promise
                index="04"
                title="You can delete everything at any time."
                body="Sign in, tap Safety & Privacy, tap Delete. Your account and every entry is removed from our servers."
              />
            </View>

            <Text style={explainerStyles.footnote}>
              This app is for adults 18+. It is not therapy, medical care, or a
              crisis line — if you feel unsafe tonight, the Support screen has
              helplines by region.
            </Text>

            <View style={explainerStyles.actions}>
              <Pressable
                onPress={onContinue}
                accessibilityRole="button"
                accessibilityLabel="I understand — continue"
                style={({ pressed }) => [
                  explainerStyles.continueBtn,
                  pressed && explainerStyles.pressed,
                ]}
              >
                <Text style={explainerStyles.continueLabel}>
                  I understand — continue
                </Text>
              </Pressable>
              <Pressable
                onPress={onCancel}
                accessibilityRole="button"
                accessibilityLabel="Not now"
                style={explainerStyles.cancel}
              >
                <Text style={explainerStyles.cancelLabel}>not now</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Promise({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <View style={explainerStyles.promise}>
      <View style={explainerStyles.promiseIndex}>
        <Text style={explainerStyles.promiseIndexText}>{index}</Text>
      </View>
      <View style={explainerStyles.promiseCopy}>
        <Text style={explainerStyles.promiseTitle}>{title}</Text>
        <Text style={explainerStyles.promiseBody}>{body}</Text>
      </View>
    </View>
  );
}

const explainerStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: space.lg, paddingBottom: space.huge },
  column: { maxWidth: layout.maxWidth, alignSelf: 'center', width: '100%' },
  back: { alignSelf: 'flex-start', paddingVertical: space.md, minHeight: 44 },
  backLabel: { ...type.body, color: brand.inkMid },
  topline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    marginBottom: space.xl,
  },
  wordmark: {
    ...type.eyebrow,
    color: brand.ink,
    fontSize: 12,
    letterSpacing: 2,
  },
  kicker: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.6, fontSize: 11 },
  title: {
    ...type.displayItalic,
    color: brand.ink,
    fontSize: 30,
    lineHeight: 36,
    marginTop: space.sm,
  },
  intro: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.md,
    lineHeight: 22,
  },
  promises: { marginTop: space.xl, gap: space.lg },
  promise: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  promiseIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.surface,
    borderWidth: 1,
    borderColor: brand.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseIndexText: { ...type.bodyStrong, color: brand.rose, fontSize: 12 },
  promiseCopy: { flex: 1 },
  promiseTitle: { ...type.bodyStrong, color: brand.ink, fontSize: 14, lineHeight: 20 },
  promiseBody: {
    ...type.bodySmall,
    color: brand.inkMid,
    marginTop: space.xs,
    lineHeight: 19,
  },
  footnote: {
    ...type.bodySmall,
    color: brand.inkFaint,
    marginTop: space.xl,
    lineHeight: 18,
  },
  actions: { marginTop: space.xl, gap: space.md },
  continueBtn: {
    minHeight: 52,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueLabel: { ...type.bodyStrong, color: brand.void, fontSize: 15 },
  cancel: { alignSelf: 'center', paddingVertical: space.md, minHeight: 44 },
  cancelLabel: { ...type.bodySmall, color: brand.inkMid, textDecorationLine: 'underline' },
  pressed: { opacity: 0.78 },
});
