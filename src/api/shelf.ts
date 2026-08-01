import { api } from './index';
import {
  parseOkResponse,
  parseShelfItemResponse,
  parseShelfList,
} from './parse-shelf';
import { SHELF_KINDS as KINDS } from './types-shelf';
export { SHELF_KINDS } from './types-shelf';
export type { ShelfItem, ShelfKind, ShelfListResponse } from './types-shelf';

import type { ShelfItem, ShelfKind, ShelfListResponse } from './types-shelf';

/**
 * How each slot is presented to the user. Server-side the kinds are opaque
 * strings; this is where the app decides what each one *feels* like.
 */
export const KIND_META: Record<
  ShelfKind,
  {
    label: string;
    titlePlaceholder: string;
    detailLabel: string | null;
    detailPlaceholder: string | null;
    maxTitle: number;
    maxDetail: number;
  }
> = {
  song_a: {
    label: 'a song',
    titlePlaceholder: 'song title',
    detailLabel: 'artist',
    detailPlaceholder: 'who made it',
    maxTitle: 120,
    maxDetail: 120,
  },
  song_b: {
    label: 'another song',
    titlePlaceholder: 'song title',
    detailLabel: 'artist',
    detailPlaceholder: 'who made it',
    maxTitle: 120,
    maxDetail: 120,
  },
  film: {
    label: 'a film',
    titlePlaceholder: 'title',
    detailLabel: 'director',
    detailPlaceholder: 'optional',
    maxTitle: 120,
    maxDetail: 120,
  },
  book: {
    label: 'a book',
    titlePlaceholder: 'title',
    detailLabel: 'author',
    detailPlaceholder: 'optional',
    maxTitle: 120,
    maxDetail: 120,
  },
  memory: {
    // Kept lowercase and quiet on purpose. Memories are the honest item.
    label: 'a memory',
    titlePlaceholder: 'one line, no names',
    detailLabel: null,
    detailPlaceholder: null,
    maxTitle: 240,
    maxDetail: 120,
  },
};

export async function getMyShelf(): Promise<ShelfListResponse> {
  const body = await api.request<unknown>('/api/shelf');
  return parseShelfList(body);
}

export async function saveShelfItem(
  kind: ShelfKind,
  title: string,
  detail?: string | null,
  piiConfirmed?: boolean,
): Promise<{ ok: boolean; item: ShelfItem }> {
  const body = await api.request<unknown>(`/api/shelf/${kind}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      detail: detail?.trim() || null,
      piiConfirmed: piiConfirmed ?? false,
    }),
  });
  return parseShelfItemResponse(body);
}

export async function clearShelfItem(kind: ShelfKind): Promise<{ ok: boolean }> {
  const body = await api.request<unknown>(`/api/shelf/${kind}`, { method: 'DELETE' });
  return parseOkResponse(body);
}

export function isKind(x: unknown): x is ShelfKind {
  return typeof x === 'string' && (KINDS as readonly string[]).includes(x);
}
