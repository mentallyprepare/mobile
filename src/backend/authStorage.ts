import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { SupportedStorage } from '@supabase/supabase-js';

const memory = new Map<string, string>();
const memoryStorage: SupportedStorage = {
  getItem: async (key) => memory.get(key) ?? null,
  setItem: async (key, value) => void memory.set(key, value),
  removeItem: async (key) => void memory.delete(key),
};
const CHUNK_SIZE = 1800;
const metaKey = (key: string) => `${key}.chunks`;
const chunkKey = (key: string, index: number) => `${key}.${index}`;

const nativeStorage: SupportedStorage = {
  async getItem(key) {
    const count = Number(await SecureStore.getItemAsync(metaKey(key)) ?? '0');
    if (!Number.isSafeInteger(count) || count <= 0 || count > 32) return null;
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))),
    );
    return chunks.some((chunk) => chunk === null) ? null : chunks.join('');
  },
  async setItem(key, value) {
    const previousCount = Number(await SecureStore.getItemAsync(metaKey(key)) ?? '0');
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'gs')) ?? [''];
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)));
    await SecureStore.setItemAsync(metaKey(key), String(chunks.length));
    if (Number.isSafeInteger(previousCount) && previousCount > chunks.length) {
      await Promise.all(
        Array.from({ length: previousCount - chunks.length }, (_, offset) =>
          SecureStore.deleteItemAsync(chunkKey(key, chunks.length + offset))),
      );
    }
  },
  async removeItem(key) {
    const count = Number(await SecureStore.getItemAsync(metaKey(key)) ?? '0');
    if (Number.isSafeInteger(count) && count > 0 && count <= 32) {
      await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(chunkKey(key, index))));
    }
    await SecureStore.deleteItemAsync(metaKey(key));
  },
};

// Web intentionally uses memory only; refresh tokens never enter localStorage.
export const authStorage = Platform.OS === 'web' ? memoryStorage : nativeStorage;
