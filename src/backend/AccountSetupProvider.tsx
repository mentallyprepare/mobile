import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSession } from '../session';
import { hasInitialAccountSetup } from './accountSetup';

type SetupState = { userId: string; complete: boolean; error: boolean } | null;
type SetupContextValue = { complete: boolean | null; error: boolean; markComplete: () => void; retry: () => void };
const SetupContext = createContext<SetupContextValue | null>(null);

export function AccountSetupProvider({ children }: { children: ReactNode }) {
  const { userId } = useSession();
  const [state, setState] = useState<SetupState>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    hasInitialAccountSetup()
      .then((complete) => { if (active) setState({ userId, complete, error: false }); })
      .catch(() => { if (active) setState({ userId, complete: false, error: true }); });
    return () => { active = false; };
  }, [userId, attempt]);

  const markComplete = useCallback(() => {
    if (userId) setState({ userId, complete: true, error: false });
  }, [userId]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  const current = state?.userId === userId ? state : null;
  const value = useMemo<SetupContextValue>(() => ({
    complete: userId ? current?.complete ?? null : null,
    error: current?.error ?? false,
    markComplete,
    retry,
  }), [userId, current, markComplete, retry]);
  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
}

export function useAccountSetup(): SetupContextValue {
  const context = useContext(SetupContext);
  if (!context) throw new Error('useAccountSetup must be used inside AccountSetupProvider');
  return context;
}
