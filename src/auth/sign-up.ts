export const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', '5th+'] as const;

export const GENDER_OPTIONS = [
  { value: 'female', label: 'woman' },
  { value: 'male', label: 'man' },
  { value: 'non-binary', label: 'non-binary' },
  { value: 'prefer_not_to_say', label: 'prefer not to say' },
] as const;

export const MATCH_GENDER_OPTIONS = [
  { value: 'any', label: 'open to anyone' },
  ...GENDER_OPTIONS,
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignUpDraft = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  college: string;
  year: string;
  gender: string;
  matchGenderPref: string;
  ageConfirmed: boolean;
  consentGiven: boolean;
};

export function accountStepError(draft: SignUpDraft): string | null {
  if (draft.name.trim().length < 2) return 'Enter the name you want us to use.';
  if (!EMAIL_PATTERN.test(draft.email.trim().toLowerCase())) {
    return 'Enter a valid email address.';
  }
  if (draft.password.length < 8) return 'Use at least eight characters for your password.';
  if (draft.password !== draft.passwordConfirmation) return 'The passwords do not match.';
  return null;
}

export function profileStepError(draft: SignUpDraft): string | null {
  if (draft.college.trim().length < 3) return 'Enter your college or university.';
  if (!YEAR_OPTIONS.includes(draft.year as (typeof YEAR_OPTIONS)[number])) {
    return 'Choose your current year.';
  }
  if (!GENDER_OPTIONS.some((option) => option.value === draft.gender)) {
    return 'Choose how you describe yourself.';
  }
  if (!MATCH_GENDER_OPTIONS.some((option) => option.value === draft.matchGenderPref)) {
    return 'Choose who you feel comfortable meeting.';
  }
  return null;
}

export function consentStepError(draft: SignUpDraft): string | null {
  if (!draft.ageConfirmed) return 'Confirm that you are 18 or older.';
  if (!draft.consentGiven) return 'Review and accept the Terms and Privacy Policy.';
  return null;
}

export function isExistingAccountStatus(status: number): boolean {
  return status === 409;
}
