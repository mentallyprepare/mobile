// Runtime parsers for the Silent Room endpoints. In its own file so nothing
// react-native touches the graph; testable in plain Node.

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
  SilentCrisisIntercept,
  SilentFeed,
  SilentLine,
  SilentPresence,
  SilentResonateResult,
  SilentSubmitOutcome,
  SilentSubmitSuccess,
} from './types-silent';

export function parseSilentPresence(v: unknown): SilentPresence {
  const o = asObject(v, '');
  return { count: field(o, '', 'count', asNumber) };
}

function parseSilentLine(v: unknown, p: string): SilentLine {
  const o = asObject(v, p);
  return {
    id: field(o, p, 'id', asString),
    content: field(o, p, 'content', asString),
    seen_count: field(o, p, 'seen_count', asNumber),
    resonance_count: field(o, p, 'resonance_count', asNumber),
    resonated: field(o, p, 'resonated', asBoolean),
  };
}

export function parseSilentFeed(v: unknown): SilentFeed {
  const o = asObject(v, '');
  return {
    lines: field(o, '', 'lines', (lv, lp) => arrayOf(lv, lp, parseSilentLine)),
    next_cursor: field(o, '', 'next_cursor', nullable(asNumber)),
  };
}

/**
 * The submit endpoint answers with one of two shapes: the ordinary success
 * body, or the crisis-intercept body when the safety scanner fires. Both are
 * status 200/201, so the client tells them apart by `status`. Everything
 * downstream branches on the parsed union.
 */
export function parseSilentSubmit(v: unknown): SilentSubmitOutcome {
  const o = asObject(v, '');
  const status = field(o, '', 'status', asString);

  if (status === 'crisis_intercepted') {
    const intercept: SilentCrisisIntercept = {
      id: null,
      status: 'crisis_intercepted',
      show_resources: true,
      message: field(o, '', 'message', asString),
      // The helplines payload is not consumed inline — the mobile support
      // screen already owns that surface. Passed through as unknown so the
      // client can hand it to a future route param without re-typing here.
      helplines: o.helplines,
    };
    return intercept;
  }

  if (status !== 'approved' && status !== 'pending') {
    throw new SchemaError(
      'status',
      `expected "approved", "pending", or "crisis_intercepted", got "${status}"`,
    );
  }

  const success: SilentSubmitSuccess = {
    id: field(o, '', 'id', asString),
    status,
    expires_at: field(o, '', 'expires_at', asString),
    presence_count: field(o, '', 'presence_count', asNumber),
    random_line: field(o, '', 'random_line', nullable(asString)),
  };
  return success;
}

export function parseSilentResonate(v: unknown): SilentResonateResult {
  const o = asObject(v, '');
  return {
    resonated: field(o, '', 'resonated', asBoolean),
    resonance_count: field(o, '', 'resonance_count', asNumber),
  };
}
