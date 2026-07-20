import { requireBackendClient } from './client';

export async function hasInitialAccountSetup(): Promise<boolean> {
  const client = requireBackendClient();
  const { data, error } = await client.from('profiles').select('onboarding_completed').maybeSingle();
  if (error) throw error;
  return data?.onboarding_completed === true;
}

export async function completeInitialAccountSetup(input: {
  anonymousName: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}): Promise<void> {
  const client = requireBackendClient();
  const { error } = await client.rpc('complete_initial_account_setup', {
    p_anonymous_name: input.anonymousName,
    p_age_confirmed: input.ageConfirmed,
    p_terms_accepted: input.termsAccepted,
    p_privacy_accepted: input.privacyAccepted,
  });
  if (error) throw error;
}
