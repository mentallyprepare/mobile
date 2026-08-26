import { api, ApiError } from './index';
import { parseTonights, parseTonightsSubmit } from './parse-tonights';
import type {
  TonightsPiiRejection,
  TonightsResponse,
  TonightsSubmitResult,
} from './types-tonights';

export type {
  TonightsFeed,
  TonightsMatched,
  TonightsMyEntry,
  TonightsResponse,
  TonightsSubmitResult,
  TonightsPiiRejection,
  TonightsWhisper,
} from './types-tonights';
export { TONIGHTS_MAX_CHARS } from './types-tonights';

export async function getTonightsQuestion(): Promise<TonightsResponse> {
  const body = await api.request<unknown>('/api/tonights-question');
  return parseTonights(body);
}

/**
 * Submit an entry to Tonight's Question. On PII the server returns 422 with
 * the offending flags; the client re-submits with `piiConfirmed: true` after
 * the writer has actually seen the warning.
 */
export async function submitTonightsQuestion(
  text: string,
  mood: string,
  piiConfirmed = false,
): Promise<TonightsSubmitResult> {
  const body = await api.request<unknown>('/api/tonights-question', {
    method: 'POST',
    body: JSON.stringify({ text, mood, piiConfirmed }),
  });
  return parseTonightsSubmit(body);
}

/** True when the server rejected a submission for PII (recoverable). */
export function isPiiRejection(err: unknown): err is ApiError & { body: TonightsPiiRejection } {
  return (
    err instanceof ApiError &&
    err.status === 422 &&
    typeof err.body === 'object' &&
    err.body !== null &&
    Array.isArray((err.body as { piiFlags?: unknown }).piiFlags)
  );
}
