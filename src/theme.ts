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
  line: 'rgba(239,234,255,0.08)',
};

// Card and panel treatment. Deliberately flat and barely-there: the surface
// should read as a slightly lighter patch of night, not as a component.
export const surface = {
  fill: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.06)',
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
