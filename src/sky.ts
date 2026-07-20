// Star placement for the Journey sky.
//
// Per docs/brief-living-night.md phase 2: x spreads across the 21 nights, y is
// derived from the seal timestamp (earlier in the evening sits higher), and the
// jitter is seeded from the user id so a given person's sky is identical on
// every visit. Nothing here is random at render time.

export type SkyEntry = { day: number; created_at: string };
export type Star = { day: number; x: number; y: number };

export const TOTAL_NIGHTS = 21;

/** Deterministic 0..1 from (userId, day). FNV-flavoured, no dependencies. */
export function seeded(userId: number, day: number): number {
  let h = 2166136261 ^ Math.imul(userId | 0, 0x9e3779b1);
  h = Math.imul(h ^ day, 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 16777619);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * Evening position, 0 = earliest, 1 = latest. The writing window runs roughly
 * 18:00 through 02:00; anything outside clamps to the ends rather than wrapping
 * to the wrong side of the sky.
 */
export function eveningFraction(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0.5;
  const minutes = d.getHours() * 60 + d.getMinutes();
  // Shift so 18:00 -> 0, wrapping past midnight into the same run.
  const shifted = minutes >= 18 * 60 ? minutes - 18 * 60 : minutes + 6 * 60;
  const span = 8 * 60; // 18:00 -> 02:00
  return Math.max(0, Math.min(1, shifted / span));
}

type Bounds = { width: number; height: number; pad?: number };

export function starPositions(
  entries: SkyEntry[],
  userId: number,
  { width, height, pad = 30 }: Bounds
): Star[] {
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;

  return entries
    .slice()
    .sort((a, b) => a.day - b.day)
    .map((entry) => {
      const dayFraction = (entry.day - 1) / (TOTAL_NIGHTS - 1);
      // Jitter keeps the line from looking plotted. Kept small so the sky still
      // reads left-to-right as the nights progress.
      const jitterX = (seeded(userId, entry.day) - 0.5) * (usableW * 0.06);
      const jitterY = (seeded(userId, entry.day + 100) - 0.5) * (usableH * 0.08);
      return {
        day: entry.day,
        x: pad + dayFraction * usableW + jitterX,
        y: pad + eveningFraction(entry.created_at) * usableH + jitterY,
      };
    });
}
