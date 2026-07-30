const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_CODE_PATTERN = /^[A-Z0-9]{6}$/;

export function canRequestPasswordReset(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim().toLowerCase());
}
export function normalizeResetCode(code: string): string {
  return code.trim().replace(/\s+/g, '').toUpperCase();
}

export function passwordResetValidation(input: {
  code: string;
  password: string;
  confirmation: string;
}): string | null {
  if (!RESET_CODE_PATTERN.test(normalizeResetCode(input.code))) {
    return 'Enter the six-character code from your email.';
  }
  if (input.password.length < 8) {
    return 'Use at least eight characters for your new password.';
  }
  if (input.password !== input.confirmation) {
    return 'The passwords do not match.';
  }
  return null;
}
