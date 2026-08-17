import { api, ApiError } from './index';
import { asBoolean, asObject, field } from './parse';

export type WaitingSaveResult = {
  ok: true;
  safety: { crisis: boolean; pii: boolean; helplines: unknown };
};

export type WaitingPiiRejection = {
  error: string;
  code: 'pii_detected';
  safety: { pii: true; piiFlags: string[] };
};

/** Server-side ceiling from routes/waiting-entry.js. */
export const WAITING_MAX_CHARS = 5000;

/**
 * POST /api/waiting-entry. Upserts a Day-1 draft that becomes the writer's
 * first entry when they get matched. Only accepted while unmatched.
 *
 * The PII path mirrors /api/tonights-question: 422 with piiFlags, client
 * shows the warning and re-submits with piiConfirmed:true. Crisis flags
 * come back on the success body's safety block; the caller routes to
 * /support after saving.
 */
export async function saveWaitingEntry(
  text: string,
  mood: string,
  selectedPrompt: string,
  piiConfirmed = false,
): Promise<WaitingSaveResult> {
  const body = await api.request<unknown>('/api/waiting-entry', {
    method: 'POST',
    body: JSON.stringify({ text, mood, selectedPrompt, piiConfirmed }),
  });
  const o = asObject(body, '');
  const safety = asObject(o.safety, 'safety');
  return {
    ok: field(o, '', 'ok', asBoolean) as true,
    safety: {
      crisis: field(safety, 'safety', 'crisis', asBoolean),
      pii: field(safety, 'safety', 'pii', asBoolean),
      helplines: safety.helplines,
    },
  };
}

/** True when the server rejected the entry for PII (recoverable). */
export function isWaitingPiiRejection(err: unknown): err is ApiError & { body: WaitingPiiRejection } {
  return (
    err instanceof ApiError &&
    err.status === 422 &&
    typeof err.body === 'object' &&
    err.body !== null &&
    (err.body as { code?: unknown }).code === 'pii_detected'
  );
}
