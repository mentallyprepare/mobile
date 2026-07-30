import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  hasSession,
  register as apiRegister,
  type RegisterInput,
} from './api/auth';
import { disableNativeNotificationsForThisDevice } from './notifications/registration';

type SessionValue = {
  /** null while we are still reading storage on cold start. */
  signedIn: boolean | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    hasSession()
      .then((has) => {
        if (!cancelled) setSignedIn(has);
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
    setSignedIn(true);
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    await apiRegister(input);
    setSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await disableNativeNotificationsForThisDevice().catch(() => {});
    await apiLogout();
    setSignedIn(false);
  }, []);

  const value = useMemo(
    () => ({ signedIn, signIn, signUp, signOut }),
    [signedIn, signIn, signUp, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside a SessionProvider');
  return ctx;
}
