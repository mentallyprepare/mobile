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

/**
 * e.g. "Night 9 of 21 — The Depth"
 *
 * Nights, not days. Entries seal at midnight, the sky counts nights, and the
 * whole product is nocturnal — "Day 9" made the app contradict itself.
 */
export function arcLabel(night: number, total: number = TOTAL_NIGHTS): string {
  return `Night ${night} of ${total} — ${phaseForNight(night)}`;
}
