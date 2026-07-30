import { api } from './index';
import type { ReportCategory } from '../safety/contracts';

export async function submitReport(input: {
  category: ReportCategory;
  reason: string;
  day?: number;
}): Promise<void> {
  await api.request('/api/report', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function blockCurrentPartner(reason: string): Promise<void> {
  await api.request('/api/block-partner', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function requestRematch(reason: string): Promise<void> {
  await api.request('/api/rematch-request', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function switchPartner(): Promise<{
  matched: boolean;
  state: 'matched' | 'waiting';
  switchesRemaining: number;
}> {
  return api.request('/api/switch-partner', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function exportMyData(): Promise<Record<string, unknown>> {
  return api.request<Record<string, unknown>>('/api/my-data');
}

export async function deleteMyAccount(password: string): Promise<void> {
  await api.request('/api/account', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}
