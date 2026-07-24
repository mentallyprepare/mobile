import { api } from './index';
import type { ArchetypeKey, Scores } from '../quiz';

export type ScanPayload = {
  scores: Scores;
  archetype: ArchetypeKey;
  answers: number[]; // 1..7, length 11
};

export type ScanResponse = {
  ok: boolean;
  /** true if the scan also produced a match this call. */
  matched: boolean;
};

/**
 * POST /api/scan. Server re-validates every field and refuses if the user is
 * already in a match (retaking after matching is not allowed).
 */
export function submitScan(payload: ScanPayload) {
  return api.request<ScanResponse>('/api/scan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
