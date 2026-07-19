// The 21-night arc, named. A poetic anchor for where the user is, nothing more:
// no new archetype system, no mechanics, no effect on matching or ECP-11.
//
// "The Depth" deliberately avoids "The Mirror", which is an existing ECP-11
// archetype shown on the mirror tab. Two different things must not share a name.

export const PHASES = ['The Descent', 'The Depth', 'The Return'] as const;
export type Phase = (typeof PHASES)[number];

export const TOTAL_NIGHTS = 21;

export function phaseForNight(night: number): Phase {
  if (night <= 7) return 'The Descent';
  if (night <= 14) return 'The Depth';
  return 'The Return';
}

/** e.g. "Day 9 of 21 — The Depth" */
export function arcLabel(night: number, total: number = TOTAL_NIGHTS): string {
  return `Day ${night} of ${total} — ${phaseForNight(night)}`;
}
