// Runtime parsers for Tonight's Question. Free of react-native so it can be
// tested in plain Node.

import {
  arrayOf,
  asBoolean,
  asNumber,
  asObject,
  asString,
  field,
  nullable,
  SchemaError,
} from './parse';
import type {
  TonightsFeed,
  TonightsMatched,
  TonightsMyEntry,
  TonightsResponse,
  TonightsSubmitResult,
  TonightsWhisper,
} from './types-tonights';

function parseWhisper(v: unknown, p: string): TonightsWhisper {
  const o = asObject(v, p);
  return {
    text: field(o, p, 'text', asString),
    mood: field(o, p, 'mood', asString),
    created_at: field(o, p, 'created_at', asString),
  };
}

function parseMyEntry(v: unknown, p: string): TonightsMyEntry {
  const o = asObject(v, p);
  return {
    text: field(o, p, 'text', asString),
    mood: field(o, p, 'mood', asString),
    created_at: field(o, p, 'created_at', asString),
  };
}

/**
 * The endpoint answers with one of two shapes: `{matched: true}` when the
 * user is already in a room (the caller should navigate away), or the full
 * pre-match feed. The parser branches on `matched` and returns a union so
 * the caller must handle both cases.
 */
export function parseTonights(v: unknown): TonightsResponse {
  const o = asObject(v, '');
  const matched = field(o, '', 'matched', asBoolean);
  if (matched) {
    const result: TonightsMatched = { matched: true };
    return result;
  }
  const feed: TonightsFeed = {
    matched: false,
    prompt: field(o, '', 'prompt', asString),
    promptIndex: field(o, '', 'promptIndex', asNumber),
    myEntry: field(o, '', 'myEntry', nullable(parseMyEntry)),
    whispers: field(o, '', 'whispers', (wv, wp) => arrayOf(wv, wp, parseWhisper)),
    writerCount: field(o, '', 'writerCount', asNumber),
    nightsWritten: field(o, '', 'nightsWritten', asNumber),
  };
  return feed;
}

export function parseTonightsSubmit(v: unknown): TonightsSubmitResult {
  const o = asObject(v, '');
  const ok = field(o, '', 'ok', asBoolean);
  if (!ok) throw new SchemaError('ok', 'expected true');
  const safety = asObject(o.safety, 'safety');
  return {
    ok: true,
    safety: {
      crisis: field(safety, 'safety', 'crisis', asBoolean),
      pii: field(safety, 'safety', 'pii', asBoolean),
      // helplines is passed through unchanged; the mobile support screen
      // already owns rendering the directory.
      helplines: safety.helplines,
    },
  };
}
