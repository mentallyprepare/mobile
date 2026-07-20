import { requireBackendClient } from './client';
import type { SealedEntry, WritingDraft } from './database.types';

export class DraftConflictError extends Error {
  constructor() {
    super('This draft changed on another device. Preserve both versions and ask the user which to keep.');
    this.name = 'DraftConflictError';
  }
}

export async function saveDraft(input: { draftId: string; ritualId: string; night: number; content: string; clientRevision: number; expectedServerRevision?: number | null }): Promise<WritingDraft> {
  const { data, error } = await requireBackendClient().rpc('save_draft', {
    p_draft_id: input.draftId,
    p_ritual_id: input.ritualId,
    p_night: input.night,
    p_content: input.content,
    p_client_revision: input.clientRevision,
    p_expected_server_revision: input.expectedServerRevision ?? 0,
  });
  if (error?.code === '40001') throw new DraftConflictError();
  if (error) throw error;
  return data;
}
export async function sealEntry(draftId: string, idempotencyKey: string): Promise<SealedEntry> {
  const { data, error } = await requireBackendClient().rpc('seal_entry', { p_draft_id: draftId, p_idempotency_key: idempotencyKey });
  if (error) throw error;
  return data;
}
