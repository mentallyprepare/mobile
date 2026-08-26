// Response types for the /api/shelf endpoints. Values-free file so both
// shelf.ts (react-native dependent) and parse-shelf.ts (react-free, so it
// is testable in plain Node) share one authoritative shape.

export const SHELF_KINDS = ['song_a', 'song_b', 'film', 'book', 'memory'] as const;
export type ShelfKind = (typeof SHELF_KINDS)[number];

export type ShelfItem = {
  kind: ShelfKind;
  title: string;
  detail: string | null;
  artworkUrl: string | null;
  updatedAt: string;
};

export type ShelfListResponse = { items: ShelfItem[] };
