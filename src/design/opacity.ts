// Opacity steps. Named by intent, not by value, so a screen never picks a
// number because it "looks about right".
//
// Note the interaction with colours.ts: `text.muted` already fails contrast at
// full opacity. Never stack an opacity below `full` on top of it — the result
// is decoration the user cannot see at all.

export const opacity = {
  full: 1,
  /** Secondary chrome that should recede without disappearing. */
  soft: 0.72,
  /** Disabled controls. Must still read as present, not absent. */
  disabled: 0.4,
  /** Hairlines, dividers, card borders drawn as a tint of the line colour. */
  hairline: 0.18,
  /** Ambient ground under a painted object. Atmosphere, never information. */
  ambient: 0.12,
  /** Modal and sheet scrim over the night. */
  scrim: 0.62,
};
