import { api, ApiError } from './index';
import { asBoolean, asObject, field } from './parse';

export type ResendVerificationResult = {
  /** True when the request went through; also true if already verified. */
  ok: boolean;
  /** True when the server confirms the account is already verified. */
  verified: boolean;
};

/**
 * POST /api/resend-verification. Requires an authenticated session.
 *
 * Two happy shapes:
 *  - `{ok: true, verified: true}` when the account is already verified
 *  - `{ok: true}` when a fresh verification email has been queued
 *
 * The server rate-limits to one send per minute; a 429 comes back as an
 * ApiError with the message string the UI should show verbatim.
 */
export async function resendVerification(): Promise<ResendVerificationResult> {
  const body = await api.request<unknown>('/api/resend-verification', {
    method: 'POST',
  });
  const o = asObject(body, '');
  const ok = field(o, '', 'ok', asBoolean);
  const verified = o.verified === undefined ? false : field(o, '', 'verified', asBoolean);
  return { ok, verified };
}

/** True when the server sent a 429 (asking the caller to wait). */
export function isVerificationRateLimit(err: unknown): boolean {
  return err instanceof ApiError && err.status === 429;
}
