// Response types for the Tonight's Question endpoints. Values-free so the
// parser can share them without pulling react-native, testable in plain Node.
//
// Contract mirrors routes/tonights-question.js. This is the pre-match writing
// surface — a community prompt for users waiting to be paired.

/** The user is already in a match; the caller should navigate away from this surface. */
export type TonightsMatched = { matched: true };

/**
 * A read from someone else's entry on the same prompt. Only text and mood
 * cross the boundary — never a name, never a userId, never a created_at
 * that could correlate to identity.
 */
export type TonightsWhisper = {
  text: string;
  mood: string;
  created_at: string;
};

/** The user's own entry for tonight, if they've written one. */
export type TonightsMyEntry = {
  text: string;
  mood: string;
  created_at: string;
};

export type TonightsFeed = {
  matched: false;
  prompt: string;
  promptIndex: number;
  myEntry: TonightsMyEntry | null;
  whispers: TonightsWhisper[];
  writerCount: number;
  nightsWritten: number;
};

export type TonightsResponse = TonightsMatched | TonightsFeed;

/**
 * Server's answer to a submission. `safety.crisis` means the scanner fired
 * and helplines are attached; the mobile client routes the user to /support
 * rather than surface a rescue conversation inline.
 */
export type TonightsSubmitResult = {
  ok: true;
  safety: {
    crisis: boolean;
    pii: boolean;
    helplines: unknown;
  };
};

/**
 * The 422 body when the server detects PII the user hasn't confirmed. The
 * client re-submits with `piiConfirmed: true` after the writer has actually
 * seen the warning and chosen to keep the text.
 */
export type TonightsPiiRejection = {
  error: string;
  piiFlags: string[];
};

export const TONIGHTS_MAX_CHARS = 5000;
