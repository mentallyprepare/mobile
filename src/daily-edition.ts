import { compactCopy, CONTENT_LIMITS } from './stardust-feed';

export const FEELINGS = ['restless', 'quiet', 'hopeful', 'heavy', 'clear'] as const;

export type Feeling = (typeof FEELINGS)[number];

const REFLECTIONS: Record<Feeling, string> = {
  restless: 'A restless night can still hold one honest sentence.',
  quiet: 'Quiet counts. You do not have to fill every space tonight.',
  hopeful: 'Keep the hopeful part close. Let the note stay simple.',
  heavy: 'You can leave the whole weight outside and write only one piece of it.',
  clear: 'Clarity does not need polishing. Write what feels true now.',
};

/** Curated copy only: no diagnosis, generation, or inference from private writing. */
export function reflectionFor(feelings: readonly Feeling[]): string {
  if (feelings.length === 0) {
    return 'Choose what feels nearest. This check-in stays on this device for now.';
  }
  if (feelings.length === 1) return compactCopy(REFLECTIONS[feelings[0]], CONTENT_LIMITS.insight);
  return compactCopy(`${REFLECTIONS[feelings[0]]} More than one feeling can be true at once.`, CONTENT_LIMITS.insight);
}
