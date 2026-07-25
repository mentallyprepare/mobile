// One dark atmosphere. Three temperatures of it.
//
// Amended 25 Jul 2026 (see docs/directive-native-social-app.md, ledger item 9):
// there is no cream Daylight world. The whole app runs on deep ink; the
// social, ritual and utility surfaces differ by accent and chrome, not by
// base colour.
//
// `deepInk` is #050311, the brand-canonical night. The directive text said
// #0A0714; that value seams against the app icon and splash, both generated
// from brand/logo-mark.svg whose sky gradient ends at #050311. Ledger item 7
// makes brand hexes win over directive hexes. Do not change this without
// regenerating the raster set in assets/images/ and brand/.

/** The base atmosphere. Shared by all three temperatures. */
export const base = {
  /** The night everything sits on. Matches brand/logo-mark.svg's sky terminus. */
  deepInk: '#050311',
  /** Raised surfaces — cards, sheets, inputs. */
  nightSurface: '#171126',
  /** Hairlines and dividers. A line, not a fill. */
  line: '#1a1330',
};

/** Accents. One per screen, never two. */
export const accent = {
  /** Brand moon. Confirmed against brand/BRAND.md — NOT #A99BF0. */
  moonViolet: '#A89BF0',
  dustyRose: '#D98EA4',
  moonCream: '#F8ECD4',
  warmAmber: '#EBCFA2',
};

/**
 * Text on `deepInk`. Measured contrast ratios are recorded because two of
 * these sit close to the accessibility floor and one falls through it.
 */
export const text = {
  /** ~17:1. Anything a user must read. */
  primary: '#EDE5F5',
  /**
   * 4.54:1 — passes WCAG AA for normal text with almost no margin.
   * Do not darken. Do not put it on `nightSurface` without re-measuring.
   */
  secondary: '#7a6fa8',
  /**
   * 2.26:1 — FAILS AA (4.5:1) and fails the 3:1 large-text/UI floor too.
   * Decoration only. Never the sole renderer of a word, a count, or a state.
   * If information is in this colour, that is a bug.
   */
  muted: '#4d426e',
};

/** Moonlit-warm — Home, Rooms, Tonight, Sealing, Reveal. */
export const moonlit = {
  bg: base.deepInk,
  surface: base.nightSurface,
  line: base.line,
  accent: accent.warmAmber,
  accentAlt: accent.moonCream,
  shadow: accent.dustyRose,
  textPrimary: text.primary,
  textSecondary: text.secondary,
  textMuted: text.muted,
};

/** Cool-lavender — Discover, Taste onboarding, Profiles, Sparks. */
export const lavender = {
  bg: base.deepInk,
  surface: base.nightSurface,
  line: base.line,
  accent: accent.moonViolet,
  accentAlt: accent.dustyRose,
  shadow: accent.moonViolet,
  textPrimary: text.primary,
  textSecondary: text.secondary,
  textMuted: text.muted,
};

/**
 * Dark utility — Settings, Privacy, Safety, Account, Blocking.
 * Near-black, no atmosphere, higher contrast than the other two. Utility
 * surfaces carry destructive actions; they get contrast, not mood.
 */
export const utility = {
  bg: '#08060F',
  surface: '#14101F',
  line: '#241C38',
  /** Destructive confirmation. Not an accent — a warning. */
  danger: '#E8A0B4',
  textPrimary: '#F4F0F8',
  /** Deliberately lighter than text.secondary: utility copy must be legible. */
  textSecondary: '#9A90BC',
};

/**
 * Living Night — the existing ritual tokens, untouched.
 * Ritual screens (Moon, NightBackground, Card, PrimaryButton, rooms.tsx) still
 * import these. They are brand-approved and pre-date the token refactor.
 * Reconcile onto `moonlit` per screen, not in bulk.
 */
export const night = {
  bg: '#050311',
  bgAlt: '#171126',

  moonQuiet: '#6B5FAE',
  moonPresent: '#A89BF0',
  ringFront: '#DDD6FF',
  ringBack: '#453E75',

  starYours: '#CFC7FF',
  starPending: '#EFEAFF',
  starTheirs: '#A89BF0',

  ink: '#EFEAFF',
  inkMid: '#8F87BB',
  inkLow: 'rgba(239,234,255,0.5)',
  inkFaint: 'rgba(143,135,187,0.5)',
  border: 'rgba(239,234,255,0.08)',

  surface: {
    gradient: ['rgba(248,242,255,0.045)', 'rgba(212,133,154,0.025)'] as [string, string],
    border: 'rgba(248,242,255,0.105)',
    fill: 'rgba(248,242,255,0.03)',
  },

  cta: {
    gradient: ['#B7657B', '#765996'] as [string, string],
    shadow: 'rgba(155,79,102,0.30)',
  },
};

/**
 * @deprecated Retired 25 Jul 2026 — the cream world is gone.
 *
 * Kept alive only so the eight screens still built on it compile and render
 * while they migrate one at a time. Do not use in new code; reach for
 * `moonlit`, `lavender` or `utility` instead.
 *
 * The `accent` value below was #A99BF0 (a typo). Corrected to the brand's
 * #A89BF0 in the same pass — see ledger item 9.
 *
 * Delete this block once app/(tabs)/*.tsx, app/scan.tsx, app/sign-in.tsx,
 * app/shelf/[kind].tsx and the four Daylight* components have moved over.
 */
export const daylight = {
  bg: '#F5F0E7',
  bgAlt: '#E7E1F8',
  surface: '#FFFFFF',
  surfaceMuted: 'rgba(9,7,26,0.03)',
  border: 'rgba(9,7,26,0.09)',

  ink: '#25152E',
  inkMid: 'rgba(37,21,46,0.62)',
  inkLow: 'rgba(37,21,46,0.38)',

  accent: accent.moonViolet,
  accentRose: accent.dustyRose,
  accentAmber: '#D7A64A',
  accentMoss: '#74836B',
  accentBlue: '#86A5BE',
  accentCoral: '#E58B75',
};

/**
 * Legacy `theme.ts` names, still imported by the ritual components.
 * Unchanged by the amendment.
 */
export const legacy = {
  sky: { early: '#0B0820', late: night.bg, gradientFrom: '#100C2E', gradientTo: night.bg },
  moon: { quiet: night.moonQuiet, present: night.moonPresent },
};
