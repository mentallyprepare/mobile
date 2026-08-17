// Response types for the Silent Room endpoints. Values-free so parse-silent
// can share them without pulling react-native — testable in plain Node.
//
// The contract mirrors routes/silent.js in the web repo. Only fields the
// mobile client reads are typed; the server projects a small extra set.

export type SilentPresence = {
  count: number;
};

/** A line as it appears in the shared feed. */
export type SilentLine = {
  id: string;
  content: string;
  seen_count: number;
  resonance_count: number;
  resonated: boolean;
};

export type SilentFeed = {
  lines: SilentLine[];
  next_cursor: number | null;
};

/**
 * Server response to a successful line submission. `presence_count` and
 * `random_line` power the post-submit celebration screen; a random line from
 * someone else appears once, quietly, then the user can return to the feed.
 */
export type SilentSubmitSuccess = {
  id: string;
  status: 'approved' | 'pending';
  expires_at: string;
  presence_count: number;
  random_line: string | null;
};

/**
 * The special 200 response the server sends when a submission trips the
 * crisis-safety scanner. `id` is null (nothing was stored), `status` is
 * 'crisis_intercepted', and `helplines` carries the exact directory the
 * mobile support screen already renders. The client routes to that screen
 * rather than surfacing a rescue conversation inline.
 */
export type SilentCrisisIntercept = {
  id: null;
  status: 'crisis_intercepted';
  show_resources: true;
  message: string;
  helplines: unknown;
};

export type SilentSubmitOutcome = SilentSubmitSuccess | SilentCrisisIntercept;

export type SilentResonateResult = {
  resonated: boolean;
  resonance_count: number;
};
