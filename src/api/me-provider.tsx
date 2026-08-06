import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getMe, type MeResponse } from './me';
import { api } from './index';
import { useSession } from '../session';

type MeContextValue = {
  data: MeResponse | null;
  loading: boolean;
  error: unknown;
  /** True once a response has been received successfully at least once. */
  hasLoaded: boolean;
  reload: () => Promise<void>;
};

const MeContext = createContext<MeContextValue | null>(null);

/**
 * One /api/me fetch for the whole tab tree. The four tabs called useMe()
 * independently, so tab switches re-fetched. Hoisted here so tabs read shared
 * state and only network on real events (mount, reload after seal, sign-out).
 *
 * A failed refresh keeps the last good response. Dropping it made a network
 * blip look identical to an account with nothing in it, which for a journaling
 * product reads as "your writing is gone". Only signing out clears the data.
 */
export function MeProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  // Reads the latest value inside the async load without making `load` depend
  // on it, which would restart the effect on every successful fetch.
  const hasLoadedRef = useRef(false);
  const requestGenerationRef = useRef(0);
  const signedInRef = useRef(signedIn);

  const load = useCallback(async () => {
    const generation = ++requestGenerationRef.current;
    setLoading(true);
    setError(null);
    try {
      if (!(await api.hasSession())) {
        if (generation !== requestGenerationRef.current) return;
        setData(null);
        setHasLoaded(false);
        hasLoadedRef.current = false;
        return;
      }
      const nextData = await getMe();
      if (
        generation !== requestGenerationRef.current ||
        signedInRef.current !== true
      ) return;
      setData(nextData);
      setHasLoaded(true);
      hasLoadedRef.current = true;
    } catch (err) {
      if (generation !== requestGenerationRef.current) return;
      setError(err);
      // Deliberately not clearing `data`. If we have never had any, it stays
      // null and the screen shows a failure — never an empty first-run state.
      if (!hasLoadedRef.current) setData(null);
    } finally {
      if (generation === requestGenerationRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    signedInRef.current = signedIn;
    // Invalidate a request belonging to the previous account/session before
    // it can publish private data into the new session's provider state.
    requestGenerationRef.current += 1;
    if (signedIn === true) {
      void Promise.resolve().then(load);
    } else if (signedIn === false) {
      void Promise.resolve().then(() => {
        setData(null);
        setError(null);
        setHasLoaded(false);
        hasLoadedRef.current = false;
        setLoading(false);
      });
    }
  }, [signedIn, load]);

  const value = useMemo(
    () => ({ data, loading, error, hasLoaded, reload: load }),
    [data, loading, error, hasLoaded, load],
  );

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMeShared(): MeContextValue {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error('useMeShared must be used inside a MeProvider');
  return ctx;
}
