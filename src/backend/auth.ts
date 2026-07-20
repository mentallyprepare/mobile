import { requireBackendClient } from './client';

export function requestEmailCode(email: string) {
  return requireBackendClient().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    // Account creation stays closed until the age and consent intake is built.
    options: { shouldCreateUser: false },
  });
}

export function verifyEmailCode(email: string, token: string) {
  return requireBackendClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token: token.trim(), type: 'email' });
}

export function signOut() { return requireBackendClient().auth.signOut({ scope: 'local' }); }
