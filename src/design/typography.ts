// Instrument Serif is for emotional display only. Manrope carries everything
// else. There is no decorative font for body copy.

export const font = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  body: 'Manrope_500Medium',
  bodyStrong: 'Manrope_600SemiBold',
};

/**
 * Dynamic type.
 *
 * React Native's `<Text>` scales with the OS font setting by default. The rule
 * here is therefore a rule about what NOT to do: never set
 * `allowFontScaling={false}` to make a layout fit. Fix the layout instead.
 * Nothing in this app is dense enough to need the escape hatch.
 */
export const RITUAL_MIN_FONT_SIZE = 12;

/**
 * Per the 25 Jul directive: no text under 12px on ritual screens. Anything
 * smaller is unreadable on a phone held at arm's length in the dark, which is
 * the only context a ritual screen is ever read in.
 *
 * `eyebrow` was 11 before the amendment and is now 12. `eyebrowMicro` at 10
 * exists for the tab bar only — chrome the user navigates by shape and
 * position, not by reading. It is not permitted on a ritual screen.
 */
export const type = {
  eyebrow: { fontFamily: font.body, fontSize: 12, letterSpacing: 1.6 },
  /** Tab bar chrome only. Never inside a Room. */
  eyebrowMicro: { fontFamily: font.body, fontSize: 10, letterSpacing: 0.6 },
  bodySmall: { fontFamily: font.body, fontSize: 12.5, lineHeight: 19 },
  body: { fontFamily: font.body, fontSize: 14, lineHeight: 22 },
  bodyStrong: { fontFamily: font.bodyStrong, fontSize: 14, lineHeight: 22 },
  label: { fontFamily: font.bodyStrong, fontSize: 12, letterSpacing: 0.2 },

  // Emotional display, used sparingly. One per screen at most.
  display: { fontFamily: font.display, fontSize: 34, lineHeight: 42 },
  displayItalic: { fontFamily: font.displayItalic, fontSize: 34, lineHeight: 42 },
  displayLarge: { fontFamily: font.displayItalic, fontSize: 44, lineHeight: 52 },
};

/** Development guard: catches sub-12px type creeping into a ritual screen. */
export function assertRitualLegible(size: number, where: string): void {
  if (__DEV__ && size < RITUAL_MIN_FONT_SIZE) {
    console.warn(
      `[type] ${where} renders at ${size}px on a ritual screen; the floor is ${RITUAL_MIN_FONT_SIZE}px.`
    );
  }
}
