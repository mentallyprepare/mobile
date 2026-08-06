// Compatibility tokens for the original ritual components. Values mirror the
// authoritative website/mobile palette in `src/design/colors.ts`.
import { brand } from './design';

export const sky = {
  // Time-aware background. `early` before 23:30 IST, `late` after.
  early: brand.sky,
  late: brand.void,
  // The mark's own sky gradient.
  gradientFrom: brand.sky,
  gradientTo: brand.void,
};

export const moon = {
  quiet: brand.purple, // partner hasn't sealed tonight, no glow
  present: brand.rose, // partner sealed something tonight, glow blooms
  gradientFrom: brand.purple,
  gradientTo: '#3A2B52',
};

export const ring = {
  front: brand.gold,
  back: brand.purple,
};

export const star = {
  yours: brand.rose, // one per sealed entry
  pending: brand.ink, // tonight's not-yet-sealed star
  theirs: brand.purple, // match's sky, positions only
};

export const ink = {
  high: brand.ink,
  mid: brand.inkMid,
  low: brand.inkLow,
  // Ambient signals that should register without asking to be read.
  faint: brand.inkFaint,
  line: brand.line,
};

// Card and panel treatment, carried over from the web app. The gradient runs
// cool-to-warm: a flat neutral fill reads grey and makes the night feel thin.
export const surface = {
  gradient: ['rgba(248,242,255,0.045)', 'rgba(212,133,154,0.025)'] as [string, string],
  border: 'rgba(248,242,255,0.105)',
  // Flat fill for small chrome (inputs, chips) where a gradient would be noise.
  fill: 'rgba(248,242,255,0.03)',
};

// The one saturated element on a screen. A translucent pill reads as disabled.
export const cta = {
  gradient: [brand.rose, brand.purple] as [string, string],
  shadow: 'rgba(235,180,194,0.24)',
};

// Ambient ground so cards sit on something instead of floating on black.
export const glow = {
  rose: brand.rose,
  roseOpacity: 0.14,
  purple: brand.purple,
  purpleOpacity: 0.16,
};

// One column, centred, with real margins. Screens should feel like a room,
// not a form: generous vertical air, nothing running edge to edge.
export const layout = {
  maxWidth: 400,
  gutter: 28,
};

export const font = {
  display: 'InstrumentSerif_400Regular',
  // Prompts and headings are italic in the approved design. Use the real
  // italic face — Android does not synthesise italic for custom fonts.
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'Manrope_500Medium',
  bodyStrong: 'Manrope_600SemiBold',
};

export const theme = { sky, moon, ring, star, ink, font };
export default theme;
