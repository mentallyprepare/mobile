// Parsers for the smaller endpoints — scan, entry seal, switch-partner.
// One file per domain would be one file per two-line function; grouped
// here because each has one response type and no shared internal helpers.
// Kept free of react-native imports so it is testable in plain Node.

import {
  asBoolean,
  asNumber,
  asObject,
  asString,
  field,
  SchemaError,
} from './parse';

// --- /api/scan -----------------------------------------------------------

export type ScanResponse = {
  ok: boolean;
  matched: boolean;
};

export function parseScanResponse(v: unknown): ScanResponse {
  const o = asObject(v, '');
  return {
    ok: field(o, '', 'ok', asBoolean),
    matched: field(o, '', 'matched', asBoolean),
  };
}

// --- /api/entry (seal) ---------------------------------------------------

export type SealResponse = {
  ok?: boolean;
  day?: number;
  [key: string]: unknown;
};

/**
 * Sealing an entry commits the writer's most private act. The response's
 * `day` field feeds the next screen's title ("Night 9 of 21"); a wrong shape
 * would show a nonsense night number to someone who just poured themselves
 * into the box. Both fields are optional server-side and validated only when
 * present, matching the original contract.
 */
export function parseSealResponse(v: unknown): SealResponse {
  const o = asObject(v, '');
  const result: SealResponse = { ...o };
  if (o.ok !== undefined) result.ok = field(o, '', 'ok', asBoolean);
  if (o.day !== undefined) result.day = field(o, '', 'day', asNumber);
  return result;
}

// --- /api/switch-partner -------------------------------------------------

export type SwitchPartnerResponse = {
  matched: boolean;
  state: 'matched' | 'waiting';
  switchesRemaining: number;
};

export function parseSwitchPartnerResponse(v: unknown): SwitchPartnerResponse {
  const o = asObject(v, '');
  const state = field(o, '', 'state', asString);
  if (state !== 'matched' && state !== 'waiting') {
    throw new SchemaError('state', `expected "matched" or "waiting", got "${state}"`);
  }
  return {
    matched: field(o, '', 'matched', asBoolean),
    state,
    switchesRemaining: field(o, '', 'switchesRemaining', asNumber),
  };
}
