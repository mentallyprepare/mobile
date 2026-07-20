import { requireBackendClient } from './client';
import { getOnboardingProgress, saveOnboardingProgress, type OnboardingProgress } from './onboarding';
import { getShelf, type ShelfItem } from './taste';

export type SocialIntention = { id: string; label: string };
export type MusicCandidate = {
  provider: 'apple_music';
  providerObjectId: string;
  objectType: 'artist' | 'song' | 'album';
  title: string;
  creatorName: string | null;
  imageUrl: string | null;
  releaseYear: number | null;
};
export type IdentityState = {
  hasAccount: boolean;
  complete: boolean;
  progress: OnboardingProgress | null;
  intentions: SocialIntention[];
  selectedIntentionIds: string[];
  shelf: ShelfItem[];
};

export async function getIdentityState(): Promise<IdentityState> {
  const client = requireBackendClient();
  const [{ data: profile, error: profileError }, { data: intentions, error: intentionsError }, { data: selected, error: selectedError }, progress, shelf] = await Promise.all([
    client.from('profiles').select('user_id,onboarding_completed').maybeSingle(),
    client.from('social_intentions').select('id,label').eq('active', true).order('position'),
    client.from('user_social_intentions').select('intention_id'),
    getOnboardingProgress(),
    getShelf(),
  ]);
  if (profileError) throw profileError;
  if (intentionsError) throw intentionsError;
  if (selectedError) throw selectedError;
  return {
    hasAccount: Boolean(profile), complete: profile?.onboarding_completed === true, progress,
    intentions: intentions ?? [], selectedIntentionIds: (selected ?? []).map((row) => row.intention_id), shelf,
  };
}

export async function setSocialIntentions(ids: string[]): Promise<void> {
  const { error } = await requireBackendClient().rpc('set_social_intentions', { p_intention_ids: ids });
  if (error) throw error;
}

export async function searchMusic(query: string): Promise<MusicCandidate[]> {
  const { data, error } = await requireBackendClient().functions.invoke('music-catalog', { body: { action: 'search', query } });
  if (error) throw error;
  if (!data || !Array.isArray(data.items)) throw new Error('Invalid music provider response');
  return data.items as MusicCandidate[];
}

export async function addProviderMusic(candidate: MusicCandidate, identityRoles: string[]): Promise<void> {
  const { data, error } = await requireBackendClient().functions.invoke('music-catalog', {
    body: { action: 'save', providerObjectId: candidate.providerObjectId, identityRoles },
  });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
}

export async function addManualIdentityObject(input: { objectType: 'artist' | 'song' | 'album'; title: string; creatorName?: string; identityRoles: string[] }): Promise<void> {
  const { error } = await requireBackendClient().rpc('add_manual_identity_object', {
    p_object_type: input.objectType, p_title: input.title,
    p_creator_name: input.creatorName?.trim() || null, p_identity_roles: input.identityRoles,
  });
  if (error) throw error;
}

export async function updateIdentityObject(id: string, update: {
  personalNote?: string | null;
  emotionalMeaning?: string | null;
  visibility?: 'private' | 'connections' | 'profile';
  useForMatching?: boolean;
  identityRoles?: string[];
  privacyReviewedAt?: string | null;
}): Promise<void> {
  const payload = {
    personal_note: update.personalNote,
    emotional_meaning: update.emotionalMeaning,
    visibility: update.visibility,
    use_for_matching: update.useForMatching,
    identity_roles: update.identityRoles,
    privacy_reviewed_at: update.privacyReviewedAt,
  };
  const { error } = await requireBackendClient().from('user_taste_objects').update(payload).eq('id', id);
  if (error) throw error;
}

export async function advanceIdentityStage(currentStep: string, completedSteps: string[], draftData = {}): Promise<void> {
  await saveOnboardingProgress({ currentStep, completedSteps, draftData, completedAt: null });
}

export async function reorderIdentityShelf(ids: string[]): Promise<void> {
  const { error } = await requireBackendClient().rpc('reorder_identity_shelf', { p_shelf_item_ids: ids });
  if (error) throw error;
}

export async function completeIdentityOnboarding(): Promise<void> {
  const { error } = await requireBackendClient().rpc('complete_identity_onboarding', { p_enable_discovery: false });
  if (error) throw error;
}
