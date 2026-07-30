/**
 * Authoritative Mentally Prepare palette.
 * Matched to the live website design system artifact on 2026-07-30.
 * Mobile and web share one dark world; context changes hierarchy, not brand.
 */
export const brand = {
  void: '#08050F',
  card: '#0E0A18',
  sky: '#0B0820',
  ink: '#F8F2FF',
  rose: '#EBB4C2',
  gold: '#ECC885',
  purple: '#896CB5',
  line: 'rgba(248,242,255,0.08)',
  surface: 'rgba(248,242,255,0.04)',
  inkMid: 'rgba(248,242,255,0.62)',
  inkLow: 'rgba(248,242,255,0.38)',
  inkFaint: 'rgba(248,242,255,0.20)',
} as const;

/** Legacy utility token name, now mapped into the shared dark brand world. */
export const daylight = {
  bg: brand.void,
  bgAlt: brand.sky,
  surface: brand.card,
  surfaceMuted: brand.surface,
  border: brand.line,

  ink: brand.ink,
  inkMid: brand.inkMid,
  inkLow: brand.inkLow,

  accent: brand.rose,
  accentRose: brand.rose,
  accentAmber: brand.gold,
  accentMoss: brand.purple,
  accentBlue: brand.purple,
  accentCoral: brand.rose,
};

/** Living Night uses the same ground, type and accents as the website. */
export const night = {
  bg: brand.void,
  bgAlt: brand.card,

  moonQuiet: brand.purple,
  moonPresent: brand.rose,
  ringFront: brand.ink,
  ringBack: brand.purple,

  starYours: brand.rose,
  starPending: brand.ink,
  starTheirs: brand.purple,

  ink: brand.ink,
  inkMid: brand.inkMid,
  inkLow: brand.inkLow,
  inkFaint: brand.inkFaint,
  border: brand.line,

  surface: {
    gradient: [brand.surface, 'rgba(235,180,194,0.025)'] as [string, string],
    border: brand.line,
    fill: brand.surface,
  },

  cta: {
    gradient: [brand.rose, brand.purple] as [string, string],
    shadow: 'rgba(235,180,194,0.24)',
  },
};

/**
 * Legacy `theme.ts` names. Kept so existing ritual screens keep importing
 * `moon`, `star`, `ink`, `sky` from `src/theme` without change. Slice 1 does
 * not touch those screens — this migration is opt-in per screen.
 */
export const legacy = {
  sky: { early: brand.sky, late: brand.void, gradientFrom: brand.sky, gradientTo: brand.void },
  moon: { quiet: night.moonQuiet, present: night.moonPresent },
};
