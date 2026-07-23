import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getMyShelf, type ShelfItem, type ShelfKind } from './shelf';
import { api } from './index';
import { useSession } from '../session';

type ShelfContextValue = {
  items: ShelfItem[];
  byKind: Partial<Record<ShelfKind, ShelfItem>>;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

const ShelfContext = createContext<ShelfContextValue | null>(null);

/** One shelf fetch shared by Create (chooser) and You (display). */
export function ShelfProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useSession();
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(await api.hasSession())) {
        setItems([]);
        return;
      }
      const { items: rows } = await getMyShelf();
      setItems(rows);
    } catch (err) {
      setError(err as Error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (signedIn === true) {
      load();
    } else if (signedIn === false) {
      setItems([]);
      setLoading(false);
    }
  }, [signedIn, load]);

  const byKind = useMemo(() => {
    const out: Partial<Record<ShelfKind, ShelfItem>> = {};
    for (const it of items) out[it.kind] = it;
    return out;
  }, [items]);

  const value = useMemo(
    () => ({ items, byKind, loading, error, reload: load }),
    [items, byKind, loading, error, load],
  );

  return <ShelfContext.Provider value={value}>{children}</ShelfContext.Provider>;
}

export function useShelf(): ShelfContextValue {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error('useShelf must be used inside a ShelfProvider');
  return ctx;
}
