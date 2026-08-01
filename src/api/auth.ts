import { api } from './index';
import { parseAuthResponse } from './parse-auth';
import type { AuthResponse } from './types-auth';

/** Persists the token pair the server returns, if there is one. */
async function persist(res: AuthResponse): Promise<AuthResponse> {
  if (res?.auth?.accessToken && res?.auth?.refreshToken) {
    await api.saveTokens(res.auth);
  }
  return res;
}

export async function login(email: string, password: string) {
  const body = await api.request<unknown>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return persist(parseAuthResponse(body));
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
  const body = await api.request<unknown>('/api/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return persist(parseAuthResponse(body));
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
