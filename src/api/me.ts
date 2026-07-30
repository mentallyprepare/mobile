import { useCallback, useEffect, useState } from 'react';
import { api } from './index';

// Shapes mirror the real /api/me response in the web repo (routes/app.js).
// Only the fields the app actually reads are typed; the endpoint returns more.

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

export function getMe() {
  return api.request<MeResponse>('/api/me');
}

type MeState = {
  data: MeResponse | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Loads /api/me. Returns `data: null` when signed out rather than throwing,
 * so screens can fall back to their signed-out state.
 */
export function useMe() {
  const [state, setState] = useState<MeState>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      if (!(await api.hasSession())) {
        setState({ data: null, loading: false, error: null });
        return;
      }
      const data = await getMe();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error });
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  return { ...state, reload: load };
}
