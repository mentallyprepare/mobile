import { useCallback, useEffect, useState } from 'react';
import { api } from './index';
import { parseMe } from './parse-me';
import type { MeResponse } from './types-me';

// Shapes mirror the real /api/me response in the web repo (routes/app.js).
// Types live in types-me.ts so parse-me.ts can share them without pulling
// react through the graph — see the comment atop that file for why.
export type {
  MeEntry,
  MeMatch,
  MeResponse,
  MeUser,
  PartnerEntryPresence,
  PartnerStatus,
} from './types-me';

export async function getMe(): Promise<MeResponse> {
  const body = await api.request<unknown>('/api/me');
  return parseMe(body);
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
