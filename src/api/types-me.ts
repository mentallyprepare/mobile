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

export type MeResponse = {
  user: MeUser;
  match: MeMatch | null;
  entries: MeEntry[];
  partnerEntries: PartnerEntryPresence[];
  partnerStatus: PartnerStatus;
  streak: number;
};
