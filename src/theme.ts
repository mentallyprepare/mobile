// Living Night design tokens. The interface reacts to true things: the hour,
// the day, the match's presence, the ritual of sealing. Keep this the single
// source of colour and type for the app.

export const sky = {
  // Time-aware background. `early` before 23:30 IST, `late` after.
  early: '#0B0820',
  late: '#050311',
  // The mark's own sky gradient.
  gradientFrom: '#100C2E',
  gradientTo: '#050311',
};

export const moon = {
  quiet: '#6B5FAE', // partner hasn't sealed tonight, no glow
  present: '#A89BF0', // partner sealed something tonight, glow blooms
  gradientFrom: '#B4A8F4',
  gradientTo: '#413670',
};

export const ring = {
  front: '#DDD6FF',
  back: '#453E75',
};

export const star = {
  yours: '#CFC7FF', // one per sealed entry
  pending: '#EFEAFF', // tonight's not-yet-sealed star
  theirs: '#A89BF0', // match's sky, positions only
};

export const ink = {
  high: '#EFEAFF',
  mid: '#8F87BB',
  low: 'rgba(239,234,255,0.5)',
  // Ambient signals that should register without asking to be read.
  faint: 'rgba(143,135,187,0.5)',
  line: 'rgba(239,234,255,0.08)',
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
  gradient: ['#B7657B', '#765996'] as [string, string],
  shadow: 'rgba(155,79,102,0.30)',
};

// Ambient ground so cards sit on something instead of floating on black.
export const glow = {
  rose: '#D4859A',
  roseOpacity: 0.14,
  purple: '#7B5EA7',
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
