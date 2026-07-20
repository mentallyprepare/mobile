import { requireBackendClient } from './client';

export type TonightData = { ritualId: string; night: number; prompt: string; partnerPseudonym: string; partnerHasSealed: boolean };

export async function getTonight(): Promise<TonightData | null> {
  const client = requireBackendClient();
  const { data: membership, error: membershipError } = await client.from('match_memberships')
    .select('match_id, partner_pseudonym').eq('state', 'active').maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data: ritual, error: ritualError } = await client.from('rituals')
    .select('id, current_night').eq('match_id', membership.match_id).eq('state', 'active').maybeSingle();
  if (ritualError) throw ritualError;
  if (!ritual) return null;

  const [{ data: prompt, error: promptError }, { data: presence, error: presenceError }, { data: auth }] = await Promise.all([
    client.from('daily_prompts').select('prompt').eq('night', ritual.current_night).eq('active', true).limit(1).maybeSingle(),
    client.from('partner_presence').select('user_id, has_sealed').eq('ritual_id', ritual.id).eq('night', ritual.current_night),
    client.auth.getUser(),
  ]);
  if (promptError) throw promptError;
  if (presenceError) throw presenceError;
  const partnerPresence = presence?.find((row) => row.user_id !== auth.user?.id);
  return {
    ritualId: ritual.id,
    night: ritual.current_night,
    prompt: prompt?.prompt ?? '',
    partnerPseudonym: membership.partner_pseudonym,
    partnerHasSealed: Boolean(partnerPresence?.has_sealed),
  };
}
