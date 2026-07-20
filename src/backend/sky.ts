import { requireBackendClient } from './client';
import type { SkyEntry } from '../sky';

export type SkyData = { mine: SkyEntry[]; theirs: SkyEntry[]; mySeed: number; partnerSeed: number };

function stableSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

export async function getSky(): Promise<SkyData> {
  const client = requireBackendClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) throw authError ?? new Error('Authentication required');

  const { data: membership, error: membershipError } = await client.from('match_memberships')
    .select('match_id, partner_id').eq('state', 'active').maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return { mine: [], theirs: [], mySeed: stableSeed(auth.user.id), partnerSeed: 0 };

  const { data: ritual, error: ritualError } = await client.from('rituals')
    .select('id').eq('match_id', membership.match_id).maybeSingle();
  if (ritualError) throw ritualError;
  if (!ritual) return { mine: [], theirs: [], mySeed: stableSeed(auth.user.id), partnerSeed: stableSeed(membership.partner_id) };

  const [{ data: mine, error: mineError }, { data: presence, error: presenceError }] = await Promise.all([
    client.from('sealed_entries').select('night, sealed_at').eq('ritual_id', ritual.id),
    client.from('partner_presence').select('user_id, night, recorded_at, has_sealed').eq('ritual_id', ritual.id).eq('has_sealed', true),
  ]);
  if (mineError) throw mineError;
  if (presenceError) throw presenceError;
  return {
    mine: (mine ?? []).map((row) => ({ day: row.night, created_at: row.sealed_at })),
    theirs: (presence ?? []).filter((row) => row.user_id === membership.partner_id)
      .map((row) => ({ day: row.night, created_at: row.recorded_at })),
    mySeed: stableSeed(auth.user.id),
    partnerSeed: stableSeed(membership.partner_id),
  };
}
