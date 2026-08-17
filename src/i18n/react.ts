// React hook over the pure i18n module. Kept in its own file so
// src/i18n/index.ts stays react-free and testable in Node.

import { useSyncExternalStore } from 'react';
import { getLanguage, subscribe, type LanguageCode } from './index';

/**
 * Returns the current language code. Components that render t()'d strings
 * should call this to opt into re-renders when the user changes language
 * via the picker — without it, only the settings row that triggered the
 * change would update and the rest of the visible screen would stay in
 * the previous language until the user navigated away and back.
 */
export function useLanguage(): LanguageCode {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}
