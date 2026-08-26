import { ApiError, NetworkError } from './client';
import { SchemaError } from './parse';

/**
 * How a request failed, in the only terms a screen needs.
 *
 * Free of react-native imports so it can be tested in plain Node next to the
 * client it classifies.
 */
export type FailureKind =
  | 'timeout'
  | 'offline'
  | 'auth'
  | 'server'
  | 'request'
  | 'schema'
  | 'unknown';

export function classifyFailure(error: unknown): FailureKind {
  if (error instanceof NetworkError) return error.kind;
  if (error instanceof SchemaError) return 'schema';
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return 'auth';
    if (error.status >= 500) return 'server';
    if (error.status >= 400) return 'request';
    return 'unknown';
  }
  return 'unknown';
}

/**
 * Copy for a failed load.
 *
 * Two rules govern every string here. It never says or implies that anything
 * the user wrote has been lost, and it never blames the user. A failed refresh
 * is a fact about the connection, not about their account.
 */
const HEADLINES: Record<FailureKind, string> = {
  timeout: 'That took longer than expected.',
  offline: 'We couldn’t reach your account.',
  auth: 'We couldn’t confirm your session.',
  server: 'Something on our side is having trouble.',
  request: 'We couldn’t load this right now.',
  // A schema mismatch is a bug we caught at the boundary. The user needs the
  // same reassurance as any other failure — nothing was lost — without being
  // asked to think about protocol drift between client and server.
  schema: 'We couldn’t read the answer from your account.',
  unknown: 'We couldn’t load this right now.',
};

const DETAILS: Record<FailureKind, string> = {
  timeout: 'Nothing has been removed. Try again when you have a moment.',
  offline: 'Check your connection. Your existing information has not been removed.',
  auth: 'Nothing has been removed. Try again, or sign in once more.',
  server: 'Nothing has been removed. It should pass shortly.',
  request: 'Your existing information has not been removed.',
  schema: 'Nothing has been removed. Updating the app may fix this.',
  unknown: 'Your existing information has not been removed.',
};

export function failureHeadline(error: unknown): string {
  return HEADLINES[classifyFailure(error)];
}

export function failureDetail(error: unknown): string {
  return DETAILS[classifyFailure(error)];
}

/** One line, for a banner over data that is still on screen. */
export function staleNotice(error: unknown): string {
  const kind = classifyFailure(error);
  if (kind === 'offline' || kind === 'timeout') {
    return 'We couldn’t refresh this right now. What you see is your last saved version.';
  }
  return 'We couldn’t refresh this right now. Your existing information has not been removed.';
}
