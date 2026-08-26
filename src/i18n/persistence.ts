// Persists the user's manual language choice across restarts. Native uses
// expo-secure-store; web dev falls back to localStorage so hot reload works.
// Kept separate from the pure i18n module so the resolver stays free of
// react-native imports.
//
// Storage key deliberately different from the auth tokens' key set — a
// preference is not a secret; putting it in secure-store is convenience,
// not confidentiality.

import { Platform } from 'react-native';
import { normalizeLocale, setLanguage, type LanguageCode } from './index';

const LANGUAGE_KEY = 'mp:language';

async function read(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(LANGUAGE_KEY);
    } catch {
      return null;
    }
  }
  // Lazy-required so a broken native module can't break the whole graph.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const store = require('expo-secure-store') as {
      getItemAsync?: (k: string) => Promise<string | null>;
    };
    return store.getItemAsync ? await store.getItemAsync(LANGUAGE_KEY) : null;
  } catch {
    return null;
  }
}

async function write(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(LANGUAGE_KEY, value);
    } catch {
      /* quota or private-mode — the language will re-apply from device locale next boot */
    }
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const store = require('expo-secure-store') as {
      setItemAsync?: (k: string, v: string) => Promise<void>;
    };
    if (store.setItemAsync) await store.setItemAsync(LANGUAGE_KEY, value);
  } catch {
    /* same rationale */
  }
}

/**
 * Restore the user's saved language choice, if any. Falls back to the
 * device-locale-derived language when no saved choice exists. Called once
 * at boot from adoptDeviceLocale's caller — apply saved AFTER device
 * default so the manual choice wins.
 */
export async function restoreSavedLanguage(): Promise<LanguageCode | null> {
  const saved = await read();
  if (!saved) return null;
  const code = normalizeLocale(saved);
  setLanguage(code);
  return code;
}

/** Persist and apply a new language choice. */
export async function chooseLanguage(code: LanguageCode): Promise<void> {
  setLanguage(code);
  await write(code);
}
