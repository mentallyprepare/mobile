// Runtime parser for /api/me. Kept in its own file so the parser has no
// react/react-native imports and can be tested in plain Node.

import type {
  MeEntry,
  MeMatch,
  MeResponse,
  MeUser,
  PartnerEntryPresence,
  PartnerStatus,
} from './types-me';
import {
  arrayOf,
  asBoolean,
  asNumber,
  asObject,
  asString,
  field,
  nullable,
} from './parse';

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
  };
}
