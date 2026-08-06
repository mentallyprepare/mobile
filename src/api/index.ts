import { createApiClient } from './client';
import { secureStorage } from './storage';
import { Platform } from 'react-native';

/**
 * API base URL. Override per environment with EXPO_PUBLIC_API_URL, e.g.
 * `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080 npx expo start` to hit a local
 * server from the Android emulator (10.0.2.2 is the host from inside it).
 */
const LOCAL_WEB_API = 'http://127.0.0.1:8787';
const PRODUCTION_API = 'https://mymentallyprepare.com';

/**
 * A browser running on localhost cannot call the production API directly:
 * production correctly accepts only approved deployed origins. During Expo
 * web development, use the narrow local bridge automatically. Native builds
 * and production web builds still use the production API unless explicitly
 * overridden.
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL
  || (Platform.OS === 'web' && __DEV__ ? LOCAL_WEB_API : PRODUCTION_API)
).replace(/\/$/, '');

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  storage: secureStorage,
  fetchImpl: fetch,
});

export { ApiError } from './client';
export type { AuthPair, ApiClient } from './client';
