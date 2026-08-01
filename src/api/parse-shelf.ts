// Runtime parser for /api/shelf endpoints. In its own file so no react-native
// imports enter the module graph; can be tested in plain Node.

import { SHELF_KINDS, type ShelfItem, type ShelfKind, type ShelfListResponse } from './types-shelf';
import {
  arrayOf,
  asBoolean,
  asObject,
  asString,
  field,
  nullable,
  SchemaError,
} from './parse';

function parseKind(v: unknown, p: string): ShelfKind {
  const s = asString(v, p);
  if (!(SHELF_KINDS as readonly string[]).includes(s)) {
    throw new SchemaError(p, `unknown shelf kind: ${s}`);
  }
  return s as ShelfKind;
}

function parseShelfItem(v: unknown, p: string): ShelfItem {
  const o = asObject(v, p);
  return {
    kind: field(o, p, 'kind', parseKind),
    title: field(o, p, 'title', asString),
    detail: field(o, p, 'detail', nullable(asString)),
    artworkUrl: field(o, p, 'artworkUrl', nullable(asString)),
    updatedAt: field(o, p, 'updatedAt', asString),
  };
}

export function parseShelfList(v: unknown): ShelfListResponse {
  const o = asObject(v, '');
  return {
    items: field(o, '', 'items', (iv, ip) => arrayOf(iv, ip, parseShelfItem)),
  };
}

export function parseShelfItemResponse(v: unknown): { ok: boolean; item: ShelfItem } {
  const o = asObject(v, '');
  return {
    ok: field(o, '', 'ok', asBoolean),
    item: field(o, '', 'item', parseShelfItem),
  };
}

export function parseOkResponse(v: unknown): { ok: boolean } {
  const o = asObject(v, '');
  return { ok: field(o, '', 'ok', asBoolean) };
}
