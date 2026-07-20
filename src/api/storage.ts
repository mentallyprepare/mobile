import { Platform } from 'react-native';

/**
 * Where the token pair lives.
 *
 * Native uses expo-secure-store (Keychain / EncryptedSharedPreferences). It has
 * no web implementation, so it is required lazily inside the native branch —
 * importing it at module scope pulls a native-only module into the web bundle.
 * Web falls back to localStorage, which is for development only: the web build
 * cannot reach the API anyway, since the backend sets no CORS headers.
 */
export type TokenStorage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

const webStorage: TokenStorage = {
  async get(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* non-fatal: the session simply will not persist */
    }
  },
  async remove(key) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* non-fatal */
    }
  },
};

function secureStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-secure-store');
}

const nativeStorage: TokenStorage = {
  get: (key) => secureStore().getItemAsync(key),
  set: (key, value) => secureStore().setItemAsync(key, value),
  remove: (key) => secureStore().deleteItemAsync(key),
};

export const secureStorage: TokenStorage =
  Platform.OS === 'web' ? webStorage : nativeStorage;

export { ACCESS_KEY, REFRESH_KEY } from './keys';
