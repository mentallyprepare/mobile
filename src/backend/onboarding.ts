import type { Json } from './database.types';
import { requireBackendClient } from './client';

export type OnboardingProgress = {
  currentStep: string;
  completedSteps: string[];
  draftData: Json;
  completedAt: string | null;
};

export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
  const client = requireBackendClient();
  const { data, error } = await client.from('onboarding_sessions')
    .select('current_step,completed_steps,draft_data,completed_at').maybeSingle();
  if (error) throw error;
  return data ? { currentStep: data.current_step, completedSteps: data.completed_steps, draftData: data.draft_data, completedAt: data.completed_at } : null;
}

export async function saveOnboardingProgress(progress: OnboardingProgress): Promise<void> {
  const client = requireBackendClient();
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) throw new Error('Authentication required');
  const { error } = await client.from('onboarding_sessions').upsert({
    user_id: auth.user.id,
    current_step: progress.currentStep,
    completed_steps: progress.completedSteps,
    draft_data: progress.draftData,
    completed_at: progress.completedAt,
  });
  if (error) throw error;
}
