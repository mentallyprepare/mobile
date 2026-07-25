// The three temperatures, assembled.
//
// A screen picks exactly one temperature and takes every colour from it. That
// is the whole rule. Mixing two on one surface is what makes an app look
// generated rather than designed.
//
// See docs/directive-native-social-app.md, "The three temperatures".

import { lavender, moonlit, utility } from './colors';
import { opacity } from './opacity';
import { radius } from './radius';

export type Temperature = 'moonlit' | 'lavender' | 'utility';

export type Theme = {
  name: Temperature;
  bg: string;
  surface: string;
  line: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  /** Decoration only — fails contrast. Absent on utility, which needs none. */
  textMuted?: string;
  /** Utility only: destructive confirmation. */
  danger?: string;
  /** Utility surfaces carry no atmosphere and no painted object. */
  atmospheric: boolean;
  radius: number;
};

/** Home, Rooms, Tonight, Sealing, Reveal. */
export const moonlitTheme: Theme = {
  name: 'moonlit',
  bg: moonlit.bg,
  surface: moonlit.surface,
  line: moonlit.line,
  accent: moonlit.accent,
  textPrimary: moonlit.textPrimary,
  textSecondary: moonlit.textSecondary,
  textMuted: moonlit.textMuted,
  atmospheric: true,
  radius: radius.pill,
};

/** Discover, Taste onboarding, Profiles, Sparks. */
export const lavenderTheme: Theme = {
  name: 'lavender',
  bg: lavender.bg,
  surface: lavender.surface,
  line: lavender.line,
  accent: lavender.accent,
  textPrimary: lavender.textPrimary,
  textSecondary: lavender.textSecondary,
  textMuted: lavender.textMuted,
  atmospheric: true,
  radius: radius.pill,
};

/** Settings, Privacy, Safety, Account, Blocking. */
export const utilityTheme: Theme = {
  name: 'utility',
  bg: utility.bg,
  surface: utility.surface,
  line: utility.line,
  accent: utility.textPrimary,
  textPrimary: utility.textPrimary,
  textSecondary: utility.textSecondary,
  danger: utility.danger,
  atmospheric: false,
  radius: radius.pill,
};

export const themes: Record<Temperature, Theme> = {
  moonlit: moonlitTheme,
  lavender: lavenderTheme,
  utility: utilityTheme,
};

/** Border colour drawn as a hairline tint rather than a solid fill. */
export function hairline(theme: Theme): { borderWidth: number; borderColor: string } {
  return { borderWidth: 1, borderColor: theme.line };
}

export { opacity };
