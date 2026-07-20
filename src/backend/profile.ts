import { requireBackendClient } from './client';

export type ProfileSummary = {
  anonymousName: string;
  partnerPseudonym: string | null;
  currentNight: number | null;
  partnerHasSealed: boolean;
};

export async function getProfileSummary(): Promise<ProfileSummary> {
  const client = requireBackendClient();
  const { data: profile, error: profileError } = await client.from('profiles')
    .select('anonymous_name').maybeSingle();
  if (profileError) throw profileError;

  const { data: membership, error: membershipError } = await client.from('match_memberships')
    .select('match_id, partner_id, partner_pseudonym').eq('state', 'active').maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return { anonymousName: profile?.anonymous_name ?? '', partnerPseudonym: null, currentNight: null, partnerHasSealed: false };

  const { data: ritual, error: ritualError } = await client.from('rituals')
    .select('id, current_night').eq('match_id', membership.match_id).maybeSingle();
  if (ritualError) throw ritualError;
  if (!ritual) return { anonymousName: profile?.anonymous_name ?? '', partnerPseudonym: membership.partner_pseudonym, currentNight: null, partnerHasSealed: false };

  const { data: presence, error: presenceError } = await client.from('partner_presence')
    .select('user_id, has_sealed').eq('ritual_id', ritual.id).eq('night', ritual.current_night);
  if (presenceError) throw presenceError;
  return {
    anonymousName: profile?.anonymous_name ?? '',
    partnerPseudonym: membership.partner_pseudonym,
    currentNight: ritual.current_night,
    partnerHasSealed: Boolean(presence?.find((row) => row.user_id === membership.partner_id)?.has_sealed),
  };
}
