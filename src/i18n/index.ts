// Tiny i18n runtime. Zero dependencies — takes the current language, looks
// up a key path, returns the string. Missing keys fall back to English so a
// half-translated dictionary can't leave the user with a blank label.
//
// The current-language decision:
//   1. explicit override via setLanguage() (persisted by the caller)
//   2. device locale, matched to a supported LanguageCode
//   3. English
//
// Kept free of react-native imports so the resolver is testable in plain
// Node. Device-locale detection lives in a separate module (device-locale.ts)
// so the platform bits stay out of this file's test surface.

import { en } from './en';
import { hi } from './hi';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type LanguageCode, type StringsShape } from './types';

/**
 * The dictionary registry. When a language is added, its file is imported
 * here and mapped by code. Missing keys fall back to English at lookup time.
 */
const DICTIONARIES: Partial<Record<LanguageCode, StringsShape>> = {
  en,
  hi,
  // ta, bn, mr — coming in a followup once translations are reviewed.
};

let currentLanguage: LanguageCode = 'en';

export function setLanguage(code: LanguageCode): void {
  if (!SUPPORTED_LANGUAGES.includes(code)) return;
  currentLanguage = code;
}

export function getLanguage(): LanguageCode {
  return currentLanguage;
}

/**
 * Turn a device locale ('en-US', 'hi-IN', 'ta_IN') into a LanguageCode the
 * app knows. Only the primary tag matters — a Bengali user in the US and
 * one in India both get Bengali. Unknown languages return English.
 */
export function normalizeLocale(locale: string | null | undefined): LanguageCode {
  if (!locale) return 'en';
  const primary = locale.toLowerCase().split(/[-_]/)[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(primary)
    ? (primary as LanguageCode)
    : 'en';
}

/**
 * Look up a translation for `key` in the current language. `key` is a dotted
 * path through the StringsShape tree. English is the fallback — a language
 * that hasn't translated a key still shows the English text rather than a
 * blank label. Never invents; a truly missing key returns the key itself so
 * tests catch it.
 */
export function t(key: string): string {
  const value = lookup(currentLanguage, key) ?? lookup('en', key);
  return typeof value === 'string' ? value : key;
}

function lookup(code: LanguageCode, key: string): string | undefined {
  const dict = DICTIONARIES[code];
  if (!dict) return undefined;
  let node: unknown = dict;
  for (const segment of key.split('.')) {
    if (node && typeof node === 'object' && segment in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

export { LANGUAGE_NAMES, SUPPORTED_LANGUAGES };
export type { LanguageCode, StringsShape };
