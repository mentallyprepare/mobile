import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getMe, type MeResponse } from './me';
import { api } from './index';
import { useSession } from '../session';

type MeContextValue = {
  data: MeResponse | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

const MeContext = createContext<MeContextValue | null>(null);

/**
 * One /api/me fetch for the whole tab tree. The four tabs called useMe()
 * independently, so tab switches re-fetched. Hoisted here so tabs read shared
 * state and only network on real events (mount, reload after seal, sign-out).
 */
export function MeProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(await api.hasSession())) {
        setData(null);
        return;
      }
      setData(await getMe());
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (signedIn === true) {
      load();
    } else if (signedIn === false) {
      setData(null);
      setLoading(false);
    }
  }, [signedIn, load]);

  const value = useMemo(() => ({ data, loading, error, reload: load }), [data, loading, error, load]);

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMeShared(): MeContextValue {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error('useMeShared must be used inside a MeProvider');
  return ctx;
}
