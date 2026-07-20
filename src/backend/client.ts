import 'react-native-url-polyfill/auto';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { authStorage } from './authStorage';
import { backendConfigured, requireBackendConfig } from './config';
import type { Database } from './database.types';

let singleton: SupabaseClient<Database> | null = null;

export function getBackendClient(): SupabaseClient<Database> | null {
  if (!backendConfigured) return null;
  if (singleton) return singleton;
  const { url, publishableKey } = requireBackendConfig();
  singleton = createClient<Database>(url, publishableKey, {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: Platform.OS !== 'web',
      detectSessionInUrl: false,
      lock: processLock,
    },
    global: { headers: { 'X-Client-Info': 'mentally-prepare-mobile/0.1.0' } },
  });
  return singleton;
}

export function requireBackendClient(): SupabaseClient<Database> {
  const client = getBackendClient();
  if (!client) requireBackendConfig();
  return client as SupabaseClient<Database>;
}
