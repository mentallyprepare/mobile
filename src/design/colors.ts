// Two visual worlds, one file. Daylight is the outer app (Home, Discover,
// Create, You); Living Night is the ritual interior. Utility surfaces
// (settings/safety) use native controls and are covered by neither.
//
// See docs/design-daylight-world.md and docs/directive-native-social-app.md.

/** Daylight — the finding phase. Warm cream, illustrated, rounded. */
export const daylight = {
  bg: '#F5F0E7', // cream
  bgAlt: '#E7E1F8', // pale lilac
  surface: '#FFFFFF',
  surfaceMuted: 'rgba(9,7,26,0.03)',
  border: 'rgba(9,7,26,0.09)',

  ink: '#25152E', // dark plum, high-contrast
  inkMid: 'rgba(37,21,46,0.62)',
  inkLow: 'rgba(37,21,46,0.38)',

  // Accents used sparingly, one per surface.
  accent: '#A99BF0', // moon violet
  accentRose: '#D98EA4',
  accentAmber: '#D7A64A',
  accentMoss: '#74836B',
  accentBlue: '#86A5BE',
  accentCoral: '#E58B75',
};

/** Living Night — the ritual interior. Unchanged: this is a re-export of the
 *  existing brand tokens so ritual screens keep working exactly as approved. */
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
 * Legacy `theme.ts` names. Kept so existing ritual screens keep importing
 * `moon`, `star`, `ink`, `sky` from `src/theme` without change. Slice 1 does
 * not touch those screens — this migration is opt-in per screen.
 */
export const legacy = {
  sky: { early: '#0B0820', late: night.bg, gradientFrom: '#100C2E', gradientTo: night.bg },
  moon: { quiet: night.moonQuiet, present: night.moonPresent },
};
