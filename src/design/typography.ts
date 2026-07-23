export const font = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'Manrope_500Medium',
  bodyStrong: 'Manrope_600SemiBold',
};

/** Type ramp shared by both worlds. Sizes are unitless, ready for RN. */
export const type = {
  eyebrow: { fontFamily: font.body, fontSize: 11, letterSpacing: 1.6 },
  bodySmall: { fontFamily: font.body, fontSize: 12.5, lineHeight: 19 },
  body: { fontFamily: font.body, fontSize: 14, lineHeight: 22 },
  bodyStrong: { fontFamily: font.bodyStrong, fontSize: 14, lineHeight: 22 },
  label: { fontFamily: font.bodyStrong, fontSize: 12, letterSpacing: 0.2 },

  // Emotional display, used sparingly.
  display: { fontFamily: font.display, fontSize: 34, lineHeight: 42 },
  displayItalic: { fontFamily: font.displayItalic, fontSize: 34, lineHeight: 42 },
  displayLarge: { fontFamily: font.displayItalic, fontSize: 44, lineHeight: 52 },
};
