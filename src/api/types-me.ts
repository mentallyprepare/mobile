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
 * Native clients render a partner's presence in the Living Night sky. The
 * partner's journal text and mood are deliberately never part of this
 * contract; the server projects them out before the response crosses the
 * mobile boundary.
 */
export type PartnerEntryPresence = {
  day: number;
  created_at: string;
};

export type PartnerStatus = {
  hasPartner: boolean;
  /** The presence-moon signal: has the match sealed something tonight. */
  partnerHasWrittenToday: boolean;
  nextUnsealAt: string | null;
  canSwitch: boolean;
  switchesRemaining: number;
  status: string;
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

export type MeResponse = {
  user: MeUser;
  match: MeMatch | null;
  entries: MeEntry[];
  partnerEntries: PartnerEntryPresence[];
  partnerStatus: PartnerStatus;
  streak: number;
  /** Present only from Day 21 onward for a matched user. */
  reveal: RevealState | null;
};
