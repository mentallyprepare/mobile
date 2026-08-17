// Device-locale detection lives here so src/i18n/index.ts stays free of
// react-native imports and testable in plain Node. This module IS platform-
// dependent — it reads the OS locale via NativeModules on native and via
// navigator on web.

import { NativeModules, Platform } from 'react-native';
import { normalizeLocale, setLanguage, type LanguageCode } from './index';

/**
 * Returns the current device locale as a raw string (e.g. 'en-IN', 'hi',
 * 'ta_IN'). Falls back to 'en' if the platform can't tell us.
 */
export function readDeviceLocale(): string {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language;
    }
    return 'en';
  }
  // iOS: NativeModules.SettingsManager.settings.AppleLocale (or AppleLanguages[0])
  // Android: NativeModules.I18nManager.localeIdentifier
  // Loose typing on purpose — this reads a native-side runtime shape that
  // has drifted across React Native versions; a strict typing would go
  // stale silently.
  const modules = NativeModules as Record<string, unknown>;
  const iosSettings = (modules.SettingsManager as { settings?: Record<string, unknown> } | undefined)?.settings;
  const iosLocale =
    (iosSettings?.AppleLocale as string | undefined) ??
    (Array.isArray(iosSettings?.AppleLanguages) ? (iosSettings?.AppleLanguages as string[])[0] : undefined);
  const androidLocale = (modules.I18nManager as { localeIdentifier?: string } | undefined)?.localeIdentifier;
  return String(iosLocale ?? androidLocale ?? 'en');
}

/** Applies the device locale as the current language. Call once at boot. */
export function adoptDeviceLocale(): LanguageCode {
  const code = normalizeLocale(readDeviceLocale());
  setLanguage(code);
  return code;
}
