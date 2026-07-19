import type { TokenStorage } from './storage';
import { ACCESS_KEY, REFRESH_KEY } from './keys';

export type AuthPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type FetchLike = (url: string, init?: any) => Promise<any>;

type ClientOptions = {
  baseUrl: string;
  storage: TokenStorage;
  fetchImpl: FetchLike;
};

/**
 * Bearer-token API client.
 *
 * Deliberately free of react-native imports so the retry logic can be tested
 * in plain Node: storage and fetch are injected.
 */
export function createApiClient({ baseUrl, storage, fetchImpl }: ClientOptions) {
  const root = baseUrl.replace(/\/$/, '');

  // Collapse concurrent refreshes. Several requests can 401 at once on app
  // resume; without this they would each burn a refresh round-trip.
  let refreshInFlight: Promise<boolean> | null = null;

  async function saveTokens(pair: AuthPair): Promise<void> {
    await storage.set(ACCESS_KEY, pair.accessToken);
    await storage.set(REFRESH_KEY, pair.refreshToken);
  }

  async function clearTokens(): Promise<void> {
    await storage.remove(ACCESS_KEY);
    await storage.remove(REFRESH_KEY);
  }

  async function hasSession(): Promise<boolean> {
    return !!(await storage.get(ACCESS_KEY));
  }

  async function refresh(): Promise<boolean> {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
      const refreshToken = await storage.get(REFRESH_KEY);
      if (!refreshToken) return false;
      let res: any;
      try {
        res = await fetchImpl(`${root}/api/auth/token/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Network failure is not an auth failure — keep the tokens.
        return false;
      }
      if (!res.ok) {
        // The refresh token itself is bad or revoked: this session is over.
        await clearTokens();
        return false;
      }
      const body = await res.json().catch(() => null);
      if (!body?.auth?.accessToken || !body?.auth?.refreshToken) {
        await clearTokens();
        return false;
      }
      await saveTokens(body.auth);
      return true;
    })();
    try {
      return await refreshInFlight;
    } finally {
      refreshInFlight = null;
    }
  }

  async function request<T = any>(path: string, options: any = {}): Promise<T> {
    const send = async () => {
      const access = await storage.get(ACCESS_KEY);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };
      if (access) headers.Authorization = `Bearer ${access}`;
      return fetchImpl(`${root}${path}`, { ...options, headers });
    };

    let res = await send();

    // One refresh, one retry. If it 401s again the session is genuinely gone.
    if (res.status === 401) {
      const refreshed = await refresh();
      if (refreshed) res = await send();
    }

    if (res.status === 204) return null as T;

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        (body && (body.error || body.message)) || `Request failed (${res.status})`;
      throw new ApiError(res.status, message, body);
    }
    return body as T;
  }

  return { request, refresh, saveTokens, clearTokens, hasSession };
}

export type ApiClient = ReturnType<typeof createApiClient>;
