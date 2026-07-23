import { api } from './index';

// Matches routes/shelf.js exactly. Five fixed slots.
export const SHELF_KINDS = ['song_a', 'song_b', 'film', 'book', 'memory'] as const;
export type ShelfKind = (typeof SHELF_KINDS)[number];

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

export type ShelfItem = {
  kind: ShelfKind;
  title: string;
  detail: string | null;
  artworkUrl: string | null;
  updatedAt: string;
};

export type ShelfListResponse = { items: ShelfItem[] };

export function getMyShelf() {
  return api.request<ShelfListResponse>('/api/shelf');
}

export function saveShelfItem(
  kind: ShelfKind,
  title: string,
  detail?: string | null,
  piiConfirmed?: boolean,
) {
  return api.request<{ ok: boolean; item: ShelfItem }>(`/api/shelf/${kind}`, {
    method: 'PUT',
    body: JSON.stringify({
      title,
      detail: detail?.trim() || null,
      piiConfirmed: piiConfirmed ?? false,
    }),
  });
}

export function clearShelfItem(kind: ShelfKind) {
  return api.request<{ ok: boolean }>(`/api/shelf/${kind}`, { method: 'DELETE' });
}

export function isKind(x: unknown): x is ShelfKind {
  return typeof x === 'string' && (SHELF_KINDS as readonly string[]).includes(x);
}
