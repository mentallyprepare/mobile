import { api } from './index';
import {
  parseSilentFeed,
  parseSilentPresence,
  parseSilentResonate,
  parseSilentSubmit,
} from './parse-silent';
import type {
  SilentFeed,
  SilentPresence,
  SilentResonateResult,
  SilentSubmitOutcome,
} from './types-silent';

export type {
  SilentFeed,
  SilentLine,
  SilentPresence,
  SilentResonateResult,
  SilentSubmitOutcome,
  SilentSubmitSuccess,
  SilentCrisisIntercept,
} from './types-silent';

/** Maximum length of a single line, matched to the server's validator. */
export const SILENT_MAX_CHARS = 200;

/** How many lines a single account can share in one day. */
export const SILENT_DAILY_LIMIT = 3;

export async function getSilentPresence(): Promise<SilentPresence> {
  const body = await api.request<unknown>('/api/silent/presence');
  return parseSilentPresence(body);
}

export async function getSilentFeed(cursor?: number): Promise<SilentFeed> {
  const q = cursor ? `?cursor=${cursor}` : '';
  const body = await api.request<unknown>(`/api/silent/feed${q}`);
  return parseSilentFeed(body);
}

export async function submitSilentLine(content: string): Promise<SilentSubmitOutcome> {
  const body = await api.request<unknown>('/api/silent', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return parseSilentSubmit(body);
}

export async function toggleSilentResonance(id: string): Promise<SilentResonateResult> {
  const body = await api.request<unknown>(`/api/silent/${id}/resonate`, {
    method: 'POST',
  });
  return parseSilentResonate(body);
}
