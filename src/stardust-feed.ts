// Home-feed data + display helpers.
//
// The **structure** is constant (ids, tones, intensities) — those are
// persistence and layout keys. The **display strings** (tag labels,
// recommendation eyebrow/title/detail, phase name/title, day label) are
// resolved at call time through the i18n runtime so a language switch
// re-renders the same rows in the current language.
//
// Consumers should call the getter functions from a component body that
// also calls `useLanguage()` so React re-renders on language changes.

import { t } from './i18n';

export type FeedTag = {
  id: string;
  label: string;
  tone: 'rose' | 'gold' | 'purple';
  intensity: 1 | 2 | 3;
};

export type FeedRecommendation = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  action: 'write' | 'check-in' | 'journey';
  tone: FeedTag['tone'];
};

export const CONTENT_LIMITS = {
  forecastTitle: 42,
  forecastBody: 110,
  insight: 130,
  recommendation: 72,
  socialMessage: 90,
} as const;

/** Whitespace-collapsing, length-capping helper. Free of i18n. */
export function compactCopy(text: string, maxLength: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const shortened = clean.slice(0, Math.max(1, maxLength - 1));
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, Math.max(lastSpace, 1))}…`;
}

// ---------- Tags: structure is constant; label routes through t() ----------

type FeedTagStructure = Omit<FeedTag, 'label'>;

/**
 * Primary feeling tags shown on the Home check-in row. IDs are persistence
 * keys — they must never change without a data migration. Labels come from
 * the i18n dictionary at `feed_tags.<id>`.
 */
export const PRIMARY_TAG_IDS: readonly FeedTagStructure[] = [
  { id: 'restless', tone: 'rose', intensity: 2 },
  { id: 'quiet', tone: 'purple', intensity: 1 },
  { id: 'hopeful', tone: 'gold', intensity: 2 },
  { id: 'heavy', tone: 'purple', intensity: 3 },
  { id: 'clear', tone: 'gold', intensity: 1 },
];

/** Extra tags revealed by the "add more" sheet. Same rule as PRIMARY_TAG_IDS. */
export const MORE_TAG_IDS: readonly FeedTagStructure[] = [
  { id: 'tender', tone: 'rose', intensity: 2 },
  { id: 'guarded', tone: 'purple', intensity: 2 },
  { id: 'curious', tone: 'gold', intensity: 1 },
  { id: 'lonely', tone: 'purple', intensity: 3 },
  { id: 'steady', tone: 'gold', intensity: 2 },
  { id: 'open', tone: 'rose', intensity: 1 },
];

export function getPrimaryTags(): FeedTag[] {
  return PRIMARY_TAG_IDS.map((tag) => ({ ...tag, label: t(`feed_tags.${tag.id}`) }));
}

export function getMoreTags(): FeedTag[] {
  return MORE_TAG_IDS.map((tag) => ({ ...tag, label: t(`feed_tags.${tag.id}`) }));
}

// ---------- Recommendations: structure is constant; display routes through t() ----------

type RecommendationStructure = Omit<FeedRecommendation, 'eyebrow' | 'title' | 'detail'> & {
  key: 'one_line' | 'arrive' | 'look_back';
};

/**
 * Home-feed recommendation cards. Keyed by `key` — the dictionary group
 * `recommendations` has three trios (<key>_eyebrow / _title / _detail).
 */
export const RECOMMENDATION_IDS: readonly RecommendationStructure[] = [
  { id: 'one-line', key: 'one_line', action: 'write', tone: 'rose' },
  { id: 'arrive', key: 'arrive', action: 'check-in', tone: 'purple' },
  { id: 'look-back', key: 'look_back', action: 'journey', tone: 'gold' },
];

export function getRecommendations(): FeedRecommendation[] {
  return RECOMMENDATION_IDS.map(({ key, ...rest }) => ({
    ...rest,
    eyebrow: t(`recommendations.${key}_eyebrow`),
    title: t(`recommendations.${key}_title`),
    detail: t(`recommendations.${key}_detail`),
  }));
}

// ---------- Phase + day-label helpers ----------

/**
 * Which arc phase a given night belongs to. Returns translated `label` and
 * `title` — safe to call from a component body wrapped in `useLanguage()`.
 * Phase boundaries themselves are structural (not translated).
 */
export function phaseForNight(night: number): { label: string; title: string } {
  const bucket =
    night <= 0 ? 'before'
    : night <= 5 ? 'arrival'
    : night <= 12 ? 'deepening'
    : night <= 18 ? 'witness'
    : 'reveal';
  return { label: t(`phase.${bucket}_label`), title: t(`phase.${bucket}_title`) };
}

/**
 * Label for a specific night relative to the current night. Three states:
 * the current night, a past night (numbered), a future night.
 */
export function selectedDayLabel(night: number, currentNight: number): string {
  if (night === currentNight) return t('day_label.tonight');
  if (night < currentNight) return `${t('day_label.past_prefix')}${night}`;
  return t('day_label.not_yet');
}
