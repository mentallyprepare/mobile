// Runtime parser for /api/login and /api/register. Kept in its own file so
// no react-native imports enter the graph — testable in plain Node.

import type { AuthPair, AuthResponse } from './types-auth';
import {
  asBoolean,
  asNumber,
  asObject,
  asString,
  field,
  nullable,
  SchemaError,
} from './parse';

function parseAuthPair(v: unknown, p: string): AuthPair {
  const o = asObject(v, p);
  const expiresIn = o.expiresIn;
  const pair: AuthPair = {
    accessToken: field(o, p, 'accessToken', asString),
    refreshToken: field(o, p, 'refreshToken', asString),
  };
  if (expiresIn !== undefined && expiresIn !== null) {
    pair.expiresIn = field(o, p, 'expiresIn', asNumber);
  }
  return pair;
}

/**
 * A successful auth response must carry a token pair the client can persist.
 * Missing tokens are how a session goes silent — the app thinks it signed in,
 * every subsequent request 401s, and the user is stuck without knowing why.
 * A malformed pair is caught here, before saveTokens hides the truth.
 */
export function parseAuthResponse(v: unknown): AuthResponse {
  const o = asObject(v, '');
  const auth = o.auth;
  const result: AuthResponse = { ...o };

  // ok and emailVerificationRequired are advisory; validate only if present.
  if (o.ok !== undefined) result.ok = field(o, '', 'ok', asBoolean);
  if (o.emailVerificationRequired !== undefined) {
    result.emailVerificationRequired = field(
      o,
      '',
      'emailVerificationRequired',
      asBoolean,
    );
  }

  // The token pair is the load-bearing part of the response. Present-and-
  // wrong must fail loudly. Absent is allowed — a login can succeed on the
  // "email verification required" branch without minting tokens yet.
  if (auth !== undefined && auth !== null) {
    result.auth = parseAuthPair(auth, 'auth');
  }
  return result;
}

// Re-export types for parity with the parseMe pattern.
export type { AuthPair, AuthResponse };
export { SchemaError, nullable };
