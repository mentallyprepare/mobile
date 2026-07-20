import type { Session } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { backendConfigured } from './config';
import { getBackendClient } from './client';

type AuthContextValue = { configured: boolean; loading: boolean; session: Session | null };
const AuthContext = createContext<AuthContextValue>({ configured: backendConfigured, loading: backendConfigured, session: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(backendConfigured);

  useEffect(() => {
    const client = getBackendClient();
    if (!client) return;
    let active = true;
    client.auth.getSession()
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    const appState = Platform.OS === 'web' ? null : AppState.addEventListener('change', (state) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
      appState?.remove();
    };
  }, []);

  const value = useMemo(() => ({ configured: backendConfigured, loading, session }), [loading, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
