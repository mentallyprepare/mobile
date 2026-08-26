// ECP-11: the psychometric quiz from the web app. Ported verbatim so both
// platforms produce identical archetypes. Do not tweak questions or scoring
// locally — the server re-validates and the site would drift.
//
// Source of truth (web app, public/app.js): the `questions` array, the
// `archetypes` map, and calculateScoresLocal(). See also POST /api/scan in
// routes/app.js which re-validates every field.

export type Axis = 'openness' | 'awareness' | 'guard' | 'reciprocity';

export type Question = {
  id: number; // 1..11 — display index
  text: string;
  category: string;
  axis: Axis;
  reverse: boolean;
};

export const QUESTIONS: Question[] = [
  { id: 1, text: "I find it easy to share what I'm really feeling with others.", category: 'Emotional Disclosure', axis: 'openness', reverse: false },
  { id: 2, text: 'Being emotionally vulnerable with someone feels safe to me.', category: 'Vulnerability Comfort', axis: 'openness', reverse: false },
  { id: 3, text: "When I'm struggling, I reach out to the people around me.", category: 'Support Seeking', axis: 'openness', reverse: false },
  { id: 4, text: "I can usually identify exactly what I'm feeling.", category: 'Emotional Awareness', axis: 'awareness', reverse: false },
  { id: 5, text: 'I often wish I had someone I could be completely honest with.', category: 'Connection Need', axis: 'awareness', reverse: true },
  { id: 6, text: "I sometimes feel alone even when I'm surrounded by people.", category: 'Loneliness Recognition', axis: 'awareness', reverse: true },
  { id: 7, text: 'I worry people will judge me if they see the real me.', category: 'Fear of Judgment', axis: 'guard', reverse: false },
  { id: 8, text: "I keep my feelings to myself even when they're overwhelming.", category: 'Emotional Suppression', axis: 'guard', reverse: false },
  { id: 9, text: "I show a version of myself to others that isn't quite real.", category: 'Performative Behaviour', axis: 'guard', reverse: false },
  { id: 10, text: 'I believe most people would try to understand me if I opened up.', category: 'Trust in Others', axis: 'reciprocity', reverse: false },
  { id: 11, text: 'I feel comfortable when someone shares their emotional struggles with me.', category: 'Empathic Comfort', axis: 'reciprocity', reverse: false },
];

/** 7-point Likert. Server accepts integers 1..7 only. */
export const SCALE_LABELS = [
  '', // placeholder so index matches 1..7
  'Strongly disagree',
  'Disagree',
  'Slightly disagree',
  'Neutral',
  'Slightly agree',
  'Agree',
  'Strongly agree',
];
export const SCALE_MIN = 1;
export const SCALE_MAX = 7;

export type ArchetypeKey = 'protector' | 'connector' | 'performer' | 'disconnector';

export type Archetype = {
  key: ArchetypeKey;
  moon: string;
  name: string;
  quote: string;
  description: string;
  strengths: string[];
  growth: string[];
  match: ArchetypeKey;
  matchName: string;
  matchMoon: string;
};

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  protector: {
    key: 'protector',
    moon: '🌑',
    name: 'The Retreating Protector',
    quote: '"You want in. You just keep locking the door."',
    description: "You feel things deeply but pull back before anyone gets close enough to see it. Your default is distance — not because you don't care, but because closeness feels like a risk you can't afford.",
    strengths: ['Deep emotional awareness', 'Strong personal boundaries', 'Thoughtful and intentional', 'Protective of those you trust'],
    growth: ['Letting people stay close without pushing them away', "Recognising that vulnerability isn't weakness", 'Trusting connection before needing proof of safety'],
    match: 'connector', matchName: 'The Anxious Connector', matchMoon: '🌒',
  },
  connector: {
    key: 'connector',
    moon: '🌒',
    name: 'The Anxious Connector',
    quote: '"You give everything. It still doesn\'t feel like enough."',
    description: "You reach toward people instinctively. You're the one who texts first, checks in, remembers things nobody else does. But underneath the warmth, there's a quiet panic — what if I'm too much?",
    strengths: ['Naturally empathetic and caring', 'Emotionally expressive', 'Deeply loyal in relationships', 'Creates warmth in every room'],
    growth: ['Receiving care without guilt', 'Letting silence be comfortable, not threatening', 'Trusting that people stay because they want to'],
    match: 'protector', matchName: 'The Retreating Protector', matchMoon: '🌑',
  },
  performer: {
    key: 'performer',
    moon: '🌓',
    name: 'The Invisible Performer',
    quote: '"Everyone knows you. Nobody knows you."',
    description: "You're great in social settings. People like you. But when the room empties, you feel something hollow. You've perfected the version people want — and lost track of the real one.",
    strengths: ['Socially adaptable and skilled', 'High emotional intelligence', 'Can connect with anyone quickly', "Deeply perceptive of others' needs"],
    growth: ['Showing the unpolished version of yourself', 'Letting relationships go deeper than surface', "Admitting when you're not okay instead of performing fine"],
    match: 'disconnector', matchName: 'The Drifting Disconnector', matchMoon: '🌔',
  },
  disconnector: {
    key: 'disconnector',
    moon: '🌔',
    name: 'The Drifting Disconnector',
    quote: '"It always starts well. Then you pull back."',
    description: "Connections start strong — there's excitement, warmth, real potential. Then something shifts. You lose interest, or it gets too close, and you drift. Not dramatically. Just quietly.",
    strengths: ['Independent and self-sufficient', 'Comfortable with solitude', 'Non-clingy and emotionally steady', 'Open to new experiences'],
    growth: ['Staying present when connection gets uncomfortable', 'Noticing the drift before it becomes distance', 'Choosing to stay — even when leaving is easier'],
    match: 'performer', matchName: 'The Invisible Performer', matchMoon: '🌓',
  },
};

export type Scores = { openness: number; awareness: number; guard: number; reciprocity: number };

/**
 * Score exactly like the web app: per-axis mean of raw (or reversed) values,
 * scaled 0..100 with max-per-item = 7. Then pick the archetype from the same
 * threshold ladder.
 */
export function scoreQuiz(answers: (number | null)[]): { scores: Scores; archetype: ArchetypeKey } {
  if (answers.length !== QUESTIONS.length) {
    throw new Error('Every question must be answered.');
  }
  const totals: Scores = { openness: 0, awareness: 0, guard: 0, reciprocity: 0 };
  const counts: Scores = { openness: 0, awareness: 0, guard: 0, reciprocity: 0 };

  QUESTIONS.forEach((q, i) => {
    const val = answers[i];
    if (val === null || val === undefined) throw new Error('Every question must be answered.');
    if (val < SCALE_MIN || val > SCALE_MAX) throw new Error('Answer out of range.');
    const score = q.reverse ? 8 - val : val;
    totals[q.axis] += score;
    counts[q.axis] += SCALE_MAX;
  });

  const pct = (t: number, c: number) => (c ? Math.round((t / c) * 100) : 50);
  const scores: Scores = {
    openness: pct(totals.openness, counts.openness),
    awareness: pct(totals.awareness, counts.awareness),
    guard: pct(totals.guard, counts.guard),
    reciprocity: pct(totals.reciprocity, counts.reciprocity),
  };

  // Same ladder the web app uses.
  const { openness: o, awareness: a, guard: g } = scores;
  let archetype: ArchetypeKey;
  if (g >= 60 && o < 50) archetype = 'protector';
  else if (o >= 55 && g < 50) archetype = 'connector';
  else if (g >= 50 && a >= 55) archetype = 'performer';
  else archetype = 'disconnector';

  return { scores, archetype };
}
