import { api } from './index';
import { asBoolean, asObject, field } from './parse';
import type { RevealChoice } from './types-me';

export type { RevealChoice, RevealState, RevealedPartner } from './types-me';

/**
 * Human-readable labels for each choice. Kept alongside the client because
 * every screen offering the choice shows the same wording, and drift between
 * labels would let two screens describe the same commitment differently.
 */
export const REVEAL_LABELS: Record<RevealChoice, { short: string; long: string }> = {
  stay_anonymous: {
    short: 'stay anonymous',
    long: 'Neither of you will see who the other was. The partnership stays private.',
  },
  first_name: {
    short: 'share my first name',
    long: 'Just your first name. Nothing else.',
  },
  name_college: {
    short: 'share my name and college',
    long: 'Your full name, your college, and your year. No email.',
  },
  contact_details: {
    short: 'share my contact details',
    long: 'Your full name, college, year, and email — so you can find each other after.',
  },
};

/**
 * The four choices in the exact order the reveal screen shows them. Least to
 * most revealing.
 */
export const REVEAL_CHOICES: readonly RevealChoice[] = [
  'stay_anonymous',
  'first_name',
  'name_college',
  'contact_details',
];

/**
 * POST /api/reveal. Locks after the first submission — the server returns 409
 * if the user tries again. Response is minimal ({ok:true}); to see the effect
 * on the reveal state (whether the partner also chose, whether the letter is
 * unlocked) the caller reloads /api/me.
 */
export async function submitRevealChoice(choice: RevealChoice): Promise<void> {
  const body = await api.request<unknown>('/api/reveal', {
    method: 'POST',
    body: JSON.stringify({ choice }),
  });
  const o = asObject(body, '');
  // The server never returns a false ok on this path — parse it so a
  // regression would be caught rather than silently missed.
  field(o, '', 'ok', asBoolean);
}
