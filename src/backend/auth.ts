import { requireBackendClient } from './client';

export function requestEmailCode(email: string, createAccount = false) {
  return requireBackendClient().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    // New accounts are requested only from the explicit 18+ and policy intake.
    options: { shouldCreateUser: createAccount },
  });
}

export function verifyEmailCode(email: string, token: string) {
  return requireBackendClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token: token.trim(), type: 'email' });
}

export function signOut() { return requireBackendClient().auth.signOut({ scope: 'local' }); }
