import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  hasSession,
  register as apiRegister,
  type RegisterInput,
} from './api/auth';
import { api } from './api';
import { disableNativeNotificationsForThisDevice } from './notifications/registration';
import { drafts } from './drafts';

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

  // When the client clears tokens because a refresh was rejected, drop the
  // session flag so RootNavigator routes to /sign-in. Without this the app
  // holds the user on an empty screen where every request 401s silently.
  useEffect(() => {
    return api.onSessionLost(() => {
      setSignedIn(false);
    });
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
    // Clear private UI immediately. Network cleanup may take a full request
    // timeout and must not leave the previous account visible meanwhile.
    setSignedIn(false);
    // Unsealed writing is local and personal. It leaves with the account, so
    // whoever signs in next on this device never inherits it.
    await drafts.discardAll().catch(() => {});
    await disableNativeNotificationsForThisDevice().catch(() => {});
    await apiLogout();
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
