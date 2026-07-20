import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { requestEmailCode, signOut as backendSignOut, verifyEmailCode } from './backend/auth';
import { useAuth } from './backend/AuthProvider';

type SessionValue = {
  signedIn: boolean | null;
  requestCode: (email: string) => Promise<void>;
  signIn: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { configured, loading, session } = useAuth();
  const signedIn = loading ? null : Boolean(session);

  const requestCode = useCallback(async (email: string) => {
    if (!configured) throw new Error('Backend is not configured.');
    const { error } = await requestEmailCode(email);
    if (error) throw error;
  }, [configured]);

  const signIn = useCallback(async (email: string, code: string) => {
    const { error } = await verifyEmailCode(email, code);
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await backendSignOut();
  }, []);

  const value = useMemo(
    () => ({ signedIn, requestCode, signIn, signOut }),
    [signedIn, requestCode, signIn, signOut],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside a SessionProvider');
  return context;
}
