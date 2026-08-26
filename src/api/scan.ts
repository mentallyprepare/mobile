import { api } from './index';
import { parseScanResponse, type ScanResponse } from './parse-endpoints';
import type { ArchetypeKey, Scores } from '../quiz';

export type ScanPayload = {
  scores: Scores;
  archetype: ArchetypeKey;
  answers: number[]; // 1..7, length 11
};

export type { ScanResponse };

/**
 * POST /api/scan. Server re-validates every field and refuses if the user is
 * already in a match (retaking after matching is not allowed).
 */
export async function submitScan(payload: ScanPayload): Promise<ScanResponse> {
  const body = await api.request<unknown>('/api/scan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return parseScanResponse(body);
}
