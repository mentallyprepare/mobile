import { requireBackendClient } from './client';
import { getProfileSummary } from './profile';
import { getShelf } from './taste';

export type MobileHomeData = {
  name: string;
  discoveryEnabled: boolean;
  shelfCount: number;
  musicCount: number;
  intentionCount: number;
  activeRoom: { partnerPseudonym: string; currentNight: number | null; partnerHasSealed: boolean } | null;
};

export async function getMobileHome(): Promise<MobileHomeData> {
  const client = requireBackendClient();
  const [{ data: profile, error: profileError }, { data: intentions, error: intentionsError }, shelf, ritual] = await Promise.all([
    client.from('profiles').select('anonymous_name,discovery_enabled').maybeSingle(),
    client.from('user_social_intentions').select('intention_id'),
    getShelf(),
    getProfileSummary(),
  ]);
  if (profileError) throw profileError;
  if (intentionsError) throw intentionsError;
  if (!profile) throw new Error('Completed profile required');
  return {
    name: profile.anonymous_name,
    discoveryEnabled: profile.discovery_enabled,
    shelfCount: shelf.length,
    musicCount: shelf.filter((item) => item.category === 'music').length,
    intentionCount: intentions?.length ?? 0,
    activeRoom: ritual.partnerPseudonym ? {
      partnerPseudonym: ritual.partnerPseudonym,
      currentNight: ritual.currentNight,
      partnerHasSealed: ritual.partnerHasSealed,
    } : null,
  };
}
