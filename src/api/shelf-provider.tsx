import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getMyShelf, type ShelfItem, type ShelfKind } from './shelf';
import { api } from './index';
import { useSession } from '../session';

type ShelfContextValue = {
  items: ShelfItem[];
  byKind: Partial<Record<ShelfKind, ShelfItem>>;
  loading: boolean;
  error: unknown;
  /** True once a response has been received successfully at least once. */
  hasLoaded: boolean;
  reload: () => Promise<void>;
};

const ShelfContext = createContext<ShelfContextValue | null>(null);

/**
 * One shelf fetch shared by the Shelf chooser and the You display.
 *
 * As with /api/me, a failed refresh keeps whatever was last loaded. An empty
 * shelf and an unreachable shelf look the same to a reader, and only one of
 * them is true.
 */
export function ShelfProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
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
        setItems([]);
        setHasLoaded(false);
        hasLoadedRef.current = false;
        return;
      }
      const { items: rows } = await getMyShelf();
      if (
        generation !== requestGenerationRef.current ||
        signedInRef.current !== true
      ) return;
      setItems(rows);
      setHasLoaded(true);
      hasLoadedRef.current = true;
    } catch (err) {
      if (generation !== requestGenerationRef.current) return;
      setError(err);
      if (!hasLoadedRef.current) setItems([]);
    } finally {
      if (generation === requestGenerationRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    signedInRef.current = signedIn;
    requestGenerationRef.current += 1;
    if (signedIn === true) {
      void Promise.resolve().then(load);
    } else if (signedIn === false) {
      void Promise.resolve().then(() => {
        setItems([]);
        setError(null);
        setHasLoaded(false);
        hasLoadedRef.current = false;
        setLoading(false);
      });
    }
  }, [signedIn, load]);

  const byKind = useMemo(() => {
    const out: Partial<Record<ShelfKind, ShelfItem>> = {};
    for (const it of items) out[it.kind] = it;
    return out;
  }, [items]);

  const value = useMemo(
    () => ({ items, byKind, loading, error, hasLoaded, reload: load }),
    [items, byKind, loading, error, hasLoaded, load],
  );

  return <ShelfContext.Provider value={value}>{children}</ShelfContext.Provider>;
}

export function useShelf(): ShelfContextValue {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error('useShelf must be used inside a ShelfProvider');
  return ctx;
}
