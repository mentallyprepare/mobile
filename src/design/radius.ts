// Corner radii.
//
// The 25 Jul directive names three values: 0 for hairlines, 12 for pills,
// 999 for round. Those are canonical and are what new code should use.
//
// The five-step scale below them (sm/md/lg/xl) is what the eight existing
// screens are built on. It is kept so they compile, and marked deprecated.
//
// FLAGGED FOR ANUSHKA: collapsing every card in the app from 20/28 down to 12
// is a visible change to the shape language, not a token rename — cards get
// noticeably squarer. It is not obviously what "12 for pills" intended, since
// 12 does not read as a pill at card scale. Confirm before the screen retint
// lands, because that is the pass where it becomes irreversible cheaply.

export const radius = {
  /** Hairlines, dividers, flush edges. */
  hairline: 0,
  /** The directive's default rounded element. */
  pill: 12,
  /** Circles — moons, avatars, dots. */
  round: 999,

  /** @deprecated pre-amendment scale; migrate to hairline/pill/round. */
  sm: 8,
  /** @deprecated */
  md: 14,
  /** @deprecated */
  lg: 20,
  /** @deprecated */
  xl: 28,
};
