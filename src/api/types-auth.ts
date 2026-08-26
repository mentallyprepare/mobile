// Response types for the auth endpoints. Values-free so parse-auth.ts stays
// free of react-native imports and can be tested in plain Node.

export type AuthPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

/**
 * A successful login/register response. The server returns other fields —
 * `user`, `session` details — that the mobile client currently ignores. Only
 * the token pair and the two flags read by app code are validated.
 */
export type AuthResponse = {
  ok?: boolean;
  auth?: AuthPair;
  emailVerificationRequired?: boolean;
  [key: string]: unknown;
};
