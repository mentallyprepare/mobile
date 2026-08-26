// Response types for /api/me. Kept in a values-free file so both me.ts
// (which imports react hooks) and parse-me.ts (which must stay react-free
// so it is testable in plain Node) can share one authoritative shape.

export type MeUser = {
  id: number;
  name: string;
  email: string;
  college: string | null;
  year: string | null;
  emailVerified: boolean;
  archetype: string | null;
};

export type MeMatch = {
  id: number;
  day: number;
  currentPrompt: string;
  partner: { archetype: string | null } | null;
  startedAt: string;
};

export type MeEntry = {
  day: number;
  text: string;
  mood: string | null;
  created_at: string;
};

/**
 * A partner's past entry, once the day has unlocked (midnight after the
 * partner sealed). The server sends `text` and `mood` too — matching the
 * web app's partner-reader — and the mobile client now surfaces them so
 * reactions and comments can hang off the actual writing.
 *
 * Only entries the server has decided are unlocked reach here; today's
 * still-sealed entry never crosses. The name stays `PartnerEntryPresence`
 * for now to avoid a rename churn; the shape is what changed.
 */
export type PartnerEntryPresence = {
  day: number;
  text: string;
  mood: string | null;
  created_at: string;
};

/**
 * The six emoji the server accepts on POST /api/react. Duplicated from
 * routes/app.js:VALID_REACTIONS. A drift on either side surfaces as a 400
 * "Invalid reaction" from the server or a SchemaError on read here.
 */
export const VALID_REACTIONS = ['🤍', '🥺', '💛', '🫂', '✨', '🌙'] as const;
export type ReactionEmoji = (typeof VALID_REACTIONS)[number];

/** Whether an item originated from the current user or their partner. */
export type FromSide = 'me' | 'partner';

/**
 * A comment on an unsealed entry from either side. Keyed by day; upsertion
 * on the server means at most one comment per user per day.
 */
export type EntryComment = {
  day: number;
  text: string;
  from: FromSide;
  created_at: string;
};

/**
 * An emoji reaction to an unsealed entry from either side. Multiple emoji
 * per day are possible (server upserts by (user, match, day, emoji) — the
 * exact key varies by version, treat as a list).
 */
export type EntryReaction = {
  day: number;
  emoji: string;
  from: FromSide;
};

export type PartnerStatus = {
  hasPartner: boolean;
  /** The presence-moon signal: has the match sealed something tonight. */
  partnerHasWrittenToday: boolean;
  nextUnsealAt: string | null;
  canSwitch: boolean;
  switchesRemaining: number;
  /** 'waiting' | 'active' | 'recent' | 'quiet' | 'dormant' (server-owned). */
  status: string;
  /** Whole days since the partner was last active. Null when no partner. */
  daysSinceActive: number | null;
  /**
   * ISO timestamp when a switch will become allowed, based on the 5-day
   * quiet window. Null when a switch is already allowed, or when there is
   * no partner. Used by the safety screen to render an honest countdown.
   */
  nextSwitchAvailableAt: string | null;
};

/**
 * The four possible reveal choices, in the exact strings the server accepts.
 * Locks after the first submission — the client must not offer to change it.
 */
export type RevealChoice =
  | 'stay_anonymous'
  | 'first_name'
  | 'name_college'
  | 'contact_details';

/**
 * Partner identity, filtered by the partner's reveal choice. `name` is always
 * a first name when present. `fullName`, `college`, `year` appear at the
 * name_college level and above. `email` only at contact_details.
 */
export type RevealedPartner = {
  name: string;
  fullName?: string;
  college?: string | null;
  year?: string | null;
  email?: string;
};

/**
 * Day-21 reveal state, projected by the server only once the match reaches
 * day 21. Null on every earlier day. Both users choose independently; if
 * either picks stay_anonymous the partnership stays private but Day-11
 * unsent letters still cross.
 */
export type RevealState = {
  available: true;
  /** null until the user has locked in a choice. */
  myChoice: RevealChoice | null;
  /** Whether the partner has locked in any choice at all. */
  partnerChose: boolean;
  /** Both users chose to reveal at some level. */
  revealed: boolean;
  /** Either user chose stay_anonymous — partnership stays private. */
  anonymous: boolean;
  /** Present only when `revealed` is true, filtered by partner's choice. */
  partner: RevealedPartner | null;
  /**
   * Partner's Day-11 unsent letter. Crosses when either both chose to reveal
   * or either chose anonymous (the letter is the send-off in both cases).
   */
  partnerUnsentLetter: string | null;
};

/**
 * Pre-match state: the Day-1 prompt and any saved draft that will become
 * the writer's first entry when they get paired. Present only when the
 * user has no match. Absent (undefined) for matched users.
 */
export type WaitingInfo = {
  archetype: string | null;
  day1Prompt: string;
  /** '' when nothing has been saved yet. */
  savedEntry: string;
};

export type MeResponse = {
  user: MeUser;
  match: MeMatch | null;
  entries: MeEntry[];
  partnerEntries: PartnerEntryPresence[];
  partnerStatus: PartnerStatus;
  streak: number;
  /** Present only from Day 21 onward for a matched user. */
  reveal: RevealState | null;
  /** Both sides of every commented night. Empty when no match or none written. */
  comments: EntryComment[];
  /** Both sides of every reacted night. Empty when no match or none set. */
  reactions: EntryReaction[];
  /** Only present pre-match; the server omits it once the user is paired. */
  waitingInfo?: WaitingInfo;
};
