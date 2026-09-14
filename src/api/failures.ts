import { ApiError, NetworkError } from './client';
import { SchemaError } from './parse';
import { t } from '../i18n';

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
 * Copy for a failed load. Resolved through the i18n runtime so a language
 * change re-renders the right string; the dictionary lives in
 * src/i18n/{en,hi}.ts under the `failures` group. Two rules govern every
 * string there: it never says or implies that anything the user wrote has
 * been lost, and it never blames the user — a failed refresh is a fact about
 * the connection, not about their account.
 */
export function failureHeadline(error: unknown): string {
  return t(`failures.${classifyFailure(error)}_headline`);
}

export function failureDetail(error: unknown): string {
  return t(`failures.${classifyFailure(error)}_detail`);
}

/** One line, for a banner over data that is still on screen. */
export function staleNotice(error: unknown): string {
  const kind = classifyFailure(error);
  if (kind === 'offline' || kind === 'timeout') {
    return t('failures.stale_offline');
  }
  return t('failures.stale_default');
}
