import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Where the token pair lives.
 *
 * Native uses expo-secure-store (Keychain / EncryptedSharedPreferences).
 * SecureStore has no web implementation, so the web build falls back to
 * localStorage — fine for development, and the web build cannot reach the API
 * anyway (the backend sets no CORS headers). Never ship web as a real client
 * without revisiting this.
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

const nativeStorage: TokenStorage = {
  get: (key) => SecureStore.getItemAsync(key),
  set: (key, value) => SecureStore.setItemAsync(key, value),
  remove: (key) => SecureStore.deleteItemAsync(key),
};

export const secureStorage: TokenStorage =
  Platform.OS === 'web' ? webStorage : nativeStorage;

export { ACCESS_KEY, REFRESH_KEY } from './keys';
