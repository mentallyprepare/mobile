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

/**
 * A request that never reached a server, or never came back.
 *
 * Kept separate from ApiError so screens can tell "we could not reach your
 * account" apart from "the server said no". The distinction matters: one of
 * them must never be rendered as though the user's writing is gone.
 */
export type NetworkFailureKind = 'timeout' | 'offline';

export class NetworkError extends Error {
  kind: NetworkFailureKind;
  constructor(kind: NetworkFailureKind, message: string) {
    super(message);
    this.name = 'NetworkError';
    this.kind = kind;
  }
}

type FetchLike = (url: string, init?: any) => Promise<any>;

type ClientOptions = {
  baseUrl: string;
  storage: TokenStorage;
  fetchImpl: FetchLike;
  /** Ceiling on a single round trip. Injected so tests do not wait it out. */
  timeoutMs?: number;
};

/** Long enough for a slow train, short enough that a spinner is never forever. */
export const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Bearer-token API client.
 *
 * Deliberately free of react-native imports so the retry logic can be tested
 * in plain Node: storage and fetch are injected.
 */
export function createApiClient({
  baseUrl,
  storage,
  fetchImpl,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: ClientOptions) {
  const root = baseUrl.replace(/\/$/, '');

  // Collapse concurrent refreshes. Several requests can 401 at once on app
  // resume; without this they would each burn a refresh round-trip.
  let refreshInFlight: Promise<boolean> | null = null;

  /**
   * One round trip with a hard ceiling.
   *
   * The timer races the fetch rather than relying on the abort signal alone:
   * an injected or polyfilled fetch may ignore `signal`, and a request that
   * hangs forever leaves a "Sealing…" button that never comes back.
   */
  async function callWithTimeout(url: string, init: any): Promise<any> {
    const controller =
      typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timer: any = null;

    const expiry = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        try {
          controller?.abort();
        } catch {
          /* aborting is best-effort */
        }
        reject(new NetworkError('timeout', 'The request took too long to answer.'));
      }, timeoutMs);
    });

    try {
      return await Promise.race([
        fetchImpl(url, controller ? { ...init, signal: controller.signal } : init),
        expiry,
      ]);
    } catch (err) {
      if (err instanceof NetworkError) throw err;
      // fetch only rejects when the request never completed: no route, DNS
      // failure, connection dropped. Nothing here reads the error text, so no
      // request body or URL can leak into a message shown to the user.
      throw new NetworkError('offline', 'The connection could not be reached.');
    } finally {
      if (timer !== null) clearTimeout(timer);
    }
  }

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
        res = await callWithTimeout(`${root}/api/auth/token/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Network failure or timeout is not an auth failure — keep the tokens.
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
      return callWithTimeout(`${root}${path}`, {
        credentials: 'include',
        ...options,
        headers,
      });
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
