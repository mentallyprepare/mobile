import { api } from './index';
import {
  parseSwitchPartnerResponse,
  type SwitchPartnerResponse,
} from './parse-endpoints';
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

export async function switchPartner(): Promise<SwitchPartnerResponse> {
  const body = await api.request<unknown>('/api/switch-partner', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return parseSwitchPartnerResponse(body);
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
