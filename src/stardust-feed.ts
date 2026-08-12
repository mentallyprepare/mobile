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

export const PRIMARY_TAGS: FeedTag[] = [
  { id: 'restless', label: 'restless', tone: 'rose', intensity: 2 },
  { id: 'quiet', label: 'quiet', tone: 'purple', intensity: 1 },
  { id: 'hopeful', label: 'hopeful', tone: 'gold', intensity: 2 },
  { id: 'heavy', label: 'heavy', tone: 'purple', intensity: 3 },
  { id: 'clear', label: 'clear', tone: 'gold', intensity: 1 },
];

export const MORE_TAGS: FeedTag[] = [
  { id: 'tender', label: 'tender', tone: 'rose', intensity: 2 },
  { id: 'guarded', label: 'guarded', tone: 'purple', intensity: 2 },
  { id: 'curious', label: 'curious', tone: 'gold', intensity: 1 },
  { id: 'lonely', label: 'lonely', tone: 'purple', intensity: 3 },
  { id: 'steady', label: 'steady', tone: 'gold', intensity: 2 },
  { id: 'open', label: 'open', tone: 'rose', intensity: 1 },
];

export const RECOMMENDATIONS: FeedRecommendation[] = [
  { id: 'one-line', eyebrow: 'FOR TONIGHT', title: 'Start with one unpolished line.', detail: 'A small true sentence is enough to enter the ritual.', action: 'write', tone: 'rose' },
  { id: 'arrive', eyebrow: 'BEFORE WRITING', title: 'Name the feeling before the story.', detail: 'Choose what feels nearest. Nothing is scored or diagnosed.', action: 'check-in', tone: 'purple' },
  { id: 'look-back', eyebrow: 'YOUR PATH', title: 'Notice what has already stayed with you.', detail: 'The constellation remembers presence, never private text.', action: 'journey', tone: 'gold' },
];

export function phaseForNight(night: number) {
  if (night <= 0) return { label: 'BEFORE NIGHT ONE', title: 'Preparing the room' };
  if (night <= 5) return { label: 'ARRIVAL', title: 'Learning the rhythm' };
  if (night <= 12) return { label: 'DEEPENING', title: 'A private rhythm forms' };
  if (night <= 18) return { label: 'WITNESS', title: 'The pattern becomes visible' };
  return { label: 'REVEAL', title: 'The final nights approach' };
}

export function selectedDayLabel(night: number, currentNight: number) {
  if (night === currentNight) return 'Tonight';
  if (night < currentNight) return `Night ${night}`;
  return 'Not yet';
}
