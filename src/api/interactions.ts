import { api } from './index';
import { asBoolean, asObject, field } from './parse';
import { VALID_REACTIONS, type ReactionEmoji } from './types-me';

export type { EntryComment, EntryReaction, ReactionEmoji } from './types-me';
export { VALID_REACTIONS } from './types-me';

/** Server-side maximum on a single comment. Mirrors routes/app.js. */
export const COMMENT_MAX_CHARS = 500;

/**
 * POST /api/react. Upserts the reaction; a second call with the same emoji
 * on the same day toggles or replaces per server logic (client should
 * refresh /api/me to see the effect).
 *
 * The server enforces: valid day (1-21), valid emoji, active match, and
 * that the day is already unsealed (day < currentDay).
 */
export async function reactToPartnerEntry(
  day: number,
  emoji: ReactionEmoji,
): Promise<void> {
  if (!(VALID_REACTIONS as readonly string[]).includes(emoji)) {
    throw new Error(`invalid reaction emoji: ${emoji}`);
  }
  const body = await api.request<unknown>('/api/react', {
    method: 'POST',
    body: JSON.stringify({ day, emoji }),
  });
  const o = asObject(body, '');
  field(o, '', 'ok', asBoolean);
}

/**
 * POST /api/comment. Upserts a single comment per user per day. Server
 * enforces a 500-char cap; if exceeded, returns 400 with a message.
 */
export async function commentOnPartnerEntry(
  day: number,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('comment text required');
  if (trimmed.length > COMMENT_MAX_CHARS) {
    throw new Error(`comment too long (max ${COMMENT_MAX_CHARS} chars)`);
  }
  const body = await api.request<unknown>('/api/comment', {
    method: 'POST',
    body: JSON.stringify({ day, text: trimmed }),
  });
  const o = asObject(body, '');
  field(o, '', 'ok', asBoolean);
}
