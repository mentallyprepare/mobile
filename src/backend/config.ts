const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const backendConfigured = Boolean(url && publishableKey);

export function requireBackendConfig() {
  if (!url || !publishableKey) {
    throw new Error('Backend is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }
  if (!/^https?:\/\//.test(url)) throw new Error('EXPO_PUBLIC_SUPABASE_URL must be an http(s) URL.');
  return { url: url.replace(/\/$/, ''), publishableKey };
}
