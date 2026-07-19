import { api } from './index';
import type { AuthPair } from './client';

type AuthResponse = {
  ok?: boolean;
  auth?: AuthPair;
  emailVerificationRequired?: boolean;
  [key: string]: unknown;
};

/** Persists the token pair the server returns, if there is one. */
async function persist(res: AuthResponse): Promise<AuthResponse> {
  if (res?.auth?.accessToken && res?.auth?.refreshToken) {
    await api.saveTokens(res.auth);
  }
  return res;
}

export async function login(email: string, password: string) {
  const res = await api.request<AuthResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return persist(res);
}

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  college: string;
  year: string;
  gender: string;
  matchGenderPref: string;
  matchYearPref: string;
  ageConfirmed: boolean;
  consentGiven: boolean;
};

export async function register(input: RegisterInput) {
  const res = await api.request<AuthResponse>('/api/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return persist(res);
}

/**
 * Clears local tokens. Also tells the server, but a failure there is not worth
 * blocking on — the tokens are gone from the device either way.
 */
export async function logout() {
  try {
    await api.request('/api/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
  await api.clearTokens();
}

export function hasSession() {
  return api.hasSession();
}
