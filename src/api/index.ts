import { createApiClient } from './client';
import { secureStorage } from './storage';

/**
 * API base URL. Override per environment with EXPO_PUBLIC_API_URL, e.g.
 * `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080 npx expo start` to hit a local
 * server from the Android emulator (10.0.2.2 is the host from inside it).
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://mymentallyprepare.com'
).replace(/\/$/, '');

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  storage: secureStorage,
  fetchImpl: fetch,
});

export { ApiError } from './client';
export type { AuthPair, ApiClient } from './client';
