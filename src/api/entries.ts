import { api } from './index';
import { parseSealResponse, type SealResponse } from './parse-endpoints';

export type SealInput = {
  text: string;
  mood?: string | null;
  selectedPrompt?: string | null;
  /**
   * The server rejects an entry with a 422 and `code: 'pii_detected'` when it
   * spots personal details. Re-send with this true only after the writer has
   * actually seen the warning and chosen to keep the text.
   */
  piiConfirmed?: boolean;
};

export type { SealResponse };

/** Seals tonight's entry. Throws ApiError on rejection (empty, PII, no match). */
export async function sealEntry(input: SealInput): Promise<SealResponse> {
  const body = await api.request<unknown>('/api/entry', {
    method: 'POST',
    body: JSON.stringify({
      text: input.text,
      mood: input.mood ?? null,
      selectedPrompt: input.selectedPrompt ?? null,
      piiConfirmed: input.piiConfirmed ?? false,
    }),
  });
  return parseSealResponse(body);
}

export const PII_CODE = 'pii_detected';
