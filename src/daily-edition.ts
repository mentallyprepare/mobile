import { compactCopy, CONTENT_LIMITS } from './stardust-feed';
import { t } from './i18n';

/**
 * Persistence keys for the five primary feelings. These are IDs used across
 * check-in state, matching, and the reflection lookup — they must not
 * change or be translated. The display labels live in the i18n dictionary
 * under `feed_tags.<id>`; the reflection copy for each feeling lives under
 * `reflections.<id>`.
 */
export const FEELINGS = ['restless', 'quiet', 'hopeful', 'heavy', 'clear'] as const;

export type Feeling = (typeof FEELINGS)[number];

/**
 * A curated reflection line for a check-in.
 *
 * Curated copy only: no diagnosis, no generation from private writing, no
 * inference. Sourced from the i18n dictionary so a language switch changes
 * the line without changing the check-in state.
 */
export function reflectionFor(feelings: readonly Feeling[]): string {
  if (feelings.length === 0) return t('reflections.empty');
  const first = t(`reflections.${feelings[0]}`);
  if (feelings.length === 1) return compactCopy(first, CONTENT_LIMITS.insight);
  return compactCopy(`${first}${t('reflections.multi_suffix')}`, CONTENT_LIMITS.insight);
}
