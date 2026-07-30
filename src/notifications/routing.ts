import type { Href } from 'expo-router';

const SAFE_ROUTES = new Set(['/rooms', '/', '/create', '/you', '/scan']);

export function routeFromNotificationData(data: unknown): Href | null {
  if (!data || typeof data !== 'object') return null;
  const route = (data as Record<string, unknown>).route;
  if (typeof route !== 'string' || !SAFE_ROUTES.has(route)) return null;
  return route as Href;
}
