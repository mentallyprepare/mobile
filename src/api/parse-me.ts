// Runtime parser for /api/me. Kept in its own file so the parser has no
// react/react-native imports and can be tested in plain Node.

import type {
  EntryComment,
  EntryReaction,
  FromSide,
  MeEntry,
  MeMatch,
  MeResponse,
  MeUser,
  PartnerEntryPresence,
  PartnerStatus,
  RevealChoice,
  RevealState,
  RevealedPartner,
  WaitingInfo,
} from './types-me';
import {
  arrayOf,
  asBoolean,
  asNumber,
  asObject,
  asString,
  field,
  nullable,
  SchemaError,
} from './parse';

const REVEAL_CHOICES: readonly RevealChoice[] = [
  'stay_anonymous',
  'first_name',
  'name_college',
  'contact_details',
];

function parseRevealChoice(v: unknown, p: string): RevealChoice {
  const s = asString(v, p);
  if (!(REVEAL_CHOICES as readonly string[]).includes(s)) {
    throw new SchemaError(p, `unknown reveal choice: ${s}`);
  }
  return s as RevealChoice;
}

function parseRevealedPartner(v: unknown, p: string): RevealedPartner {
  const o = asObject(v, p);
  const partner: RevealedPartner = {
    name: field(o, p, 'name', asString),
  };
  // Optional fields the server projects only at higher reveal levels.
  if (o.fullName !== undefined && o.fullName !== null) {
    partner.fullName = field(o, p, 'fullName', asString);
  }
  if (o.college !== undefined) {
    partner.college = field(o, p, 'college', nullable(asString));
  }
  if (o.year !== undefined) {
    partner.year = field(o, p, 'year', nullable(asString));
  }
  if (o.email !== undefined && o.email !== null) {
    partner.email = field(o, p, 'email', asString);
  }
  return partner;
}

function parseFromSide(v: unknown, p: string): FromSide {
  const s = asString(v, p);
  if (s !== 'me' && s !== 'partner') {
    throw new SchemaError(p, `expected "me" or "partner", got "${s}"`);
  }
  return s;
}

function parseComment(v: unknown, p: string): EntryComment {
  const o = asObject(v, p);
  return {
    day: field(o, p, 'day', asNumber),
    text: field(o, p, 'text', asString),
    from: field(o, p, 'from', parseFromSide),
    created_at: field(o, p, 'created_at', asString),
  };
}

function parseReaction(v: unknown, p: string): EntryReaction {
  const o = asObject(v, p);
  return {
    day: field(o, p, 'day', asNumber),
    emoji: field(o, p, 'emoji', asString),
    from: field(o, p, 'from', parseFromSide),
  };
}

function parseWaitingInfo(v: unknown, p: string): WaitingInfo {
  const o = asObject(v, p);
  return {
    archetype: field(o, p, 'archetype', nullable(asString)),
    day1Prompt: field(o, p, 'day1Prompt', asString),
    savedEntry: field(o, p, 'savedEntry', asString),
  };
}

function parseRevealState(v: unknown, p: string): RevealState {
  const o = asObject(v, p);
  // `available` guards this whole shape; if the server ever sends the field
  // without `available: true`, we treat it as malformed so callers don't
  // render a reveal surface based on stale server behaviour.
  const available = field(o, p, 'available', asBoolean);
  if (!available) {
    throw new SchemaError(`${p}.available`, 'expected true when reveal state is present');
  }
  return {
    available: true,
    myChoice: field(o, p, 'myChoice', nullable(parseRevealChoice)),
    partnerChose: field(o, p, 'partnerChose', asBoolean),
    revealed: field(o, p, 'revealed', asBoolean),
    anonymous: field(o, p, 'anonymous', asBoolean),
    partner: field(o, p, 'partner', nullable(parseRevealedPartner)),
    partnerUnsentLetter: field(o, p, 'partnerUnsentLetter', nullable(asString)),
  };
}

function parseUser(v: unknown, p: string): MeUser {
  const o = asObject(v, p);
  return {
    id: field(o, p, 'id', asNumber),
    name: field(o, p, 'name', asString),
    email: field(o, p, 'email', asString),
    college: field(o, p, 'college', nullable(asString)),
    year: field(o, p, 'year', nullable(asString)),
    emailVerified: field(o, p, 'emailVerified', asBoolean),
    archetype: field(o, p, 'archetype', nullable(asString)),
  };
}

function parseMatch(v: unknown, p: string): MeMatch {
  const o = asObject(v, p);
  const partner = field(
    o,
    p,
    'partner',
    nullable((pv, pp) => {
      const po = asObject(pv, pp);
      return { archetype: field(po, pp, 'archetype', nullable(asString)) };
    }),
  );
  return {
    id: field(o, p, 'id', asNumber),
    day: field(o, p, 'day', asNumber),
    currentPrompt: field(o, p, 'currentPrompt', asString),
    partner,
    startedAt: field(o, p, 'startedAt', asString),
  };
}

function parseEntry(v: unknown, p: string): MeEntry {
  const o = asObject(v, p);
  return {
    day: field(o, p, 'day', asNumber),
    text: field(o, p, 'text', asString),
    mood: field(o, p, 'mood', nullable(asString)),
    created_at: field(o, p, 'created_at', asString),
  };
}

function parsePartnerEntry(v: unknown, p: string): PartnerEntryPresence {
  const o = asObject(v, p);
  return {
    day: field(o, p, 'day', asNumber),
    text: field(o, p, 'text', asString),
    mood: field(o, p, 'mood', nullable(asString)),
    created_at: field(o, p, 'created_at', asString),
  };
}

function parsePartnerStatus(v: unknown, p: string): PartnerStatus {
  const o = asObject(v, p);
  return {
    hasPartner: field(o, p, 'hasPartner', asBoolean),
    partnerHasWrittenToday: field(o, p, 'partnerHasWrittenToday', asBoolean),
    nextUnsealAt: field(o, p, 'nextUnsealAt', nullable(asString)),
    canSwitch: field(o, p, 'canSwitch', asBoolean),
    switchesRemaining: field(o, p, 'switchesRemaining', asNumber),
    status: field(o, p, 'status', asString),
  };
}

export function parseMe(v: unknown): MeResponse {
  const o = asObject(v, '');
  return {
    user: field(o, '', 'user', parseUser),
    match: field(o, '', 'match', nullable(parseMatch)),
    entries: field(o, '', 'entries', (ev, ep) => arrayOf(ev, ep, parseEntry)),
    partnerEntries: field(o, '', 'partnerEntries', (ev, ep) =>
      arrayOf(ev, ep, parsePartnerEntry),
    ),
    partnerStatus: field(o, '', 'partnerStatus', parsePartnerStatus),
    streak: field(o, '', 'streak', asNumber),
    reveal: field(o, '', 'reveal', nullable(parseRevealState)),
    // The server always projects these as arrays (empty when no match); a
    // missing field would be a genuine shape drift, not an optional slot.
    comments: field(o, '', 'comments', (cv, cp) => arrayOf(cv, cp, parseComment)),
    reactions: field(o, '', 'reactions', (rv, rp) => arrayOf(rv, rp, parseReaction)),
    // The server omits waitingInfo entirely once the user is matched; only
    // validate when actually present.
    ...(o.waitingInfo !== undefined
      ? { waitingInfo: parseWaitingInfo(o.waitingInfo, 'waitingInfo') }
      : {}),
  };
}
