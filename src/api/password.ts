import { api } from './index';

export async function requestPasswordReset(email: string): Promise<void> {
  await api.request('/api/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}
export async function resetPassword(
  code: string,
  newPassword: string,
): Promise<void> {
  await api.request('/api/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      code: code.trim().replace(/\s+/g, '').toUpperCase(),
      newPassword,
    }),
  });
}
