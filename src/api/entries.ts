import { api } from './index';

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

export type SealResponse = {
  ok?: boolean;
  day?: number;
  [key: string]: unknown;
};

/** Seals tonight's entry. Throws ApiError on rejection (empty, PII, no match). */
export function sealEntry(input: SealInput) {
  return api.request<SealResponse>('/api/entry', {
    method: 'POST',
    body: JSON.stringify({
      text: input.text,
      mood: input.mood ?? null,
      selectedPrompt: input.selectedPrompt ?? null,
      piiConfirmed: input.piiConfirmed ?? false,
    }),
  });
}

export const PII_CODE = 'pii_detected';
