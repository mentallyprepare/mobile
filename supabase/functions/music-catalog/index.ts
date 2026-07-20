// @ts-nocheck -- Supabase Edge Functions run in Deno, outside the Expo compiler runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const allowedRoles = new Set(['favourite_artist', 'favourite_song', 'current_song', 'comfort_song', 'feels_like_me', 'favourite_album']);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

function normalise(result: Record<string, unknown>, type: 'artist' | 'song' | 'album') {
  const artistId = Number(result.artistId);
  const trackId = Number(result.trackId);
  const collectionId = Number(result.collectionId);
  const id = type === 'artist' ? artistId : type === 'album' ? collectionId : trackId;
  if (!Number.isFinite(id)) return null;
  const title = type === 'artist' ? String(result.artistName ?? '') : type === 'album' ? String(result.collectionName ?? '') : String(result.trackName ?? '');
  if (!title) return null;
  return {
    provider: 'apple_music',
    providerObjectId: `${type}:${id}`,
    objectType: type,
    title,
    creatorName: type === 'artist' ? null : String(result.artistName ?? '') || null,
    imageUrl: typeof result.artworkUrl100 === 'string' ? result.artworkUrl100.replace('100x100', '300x300') : null,
    releaseYear: typeof result.releaseDate === 'string' ? Number(result.releaseDate.slice(0, 4)) || null : null,
  };
}

async function providerSearch(query: string) {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', query);
  url.searchParams.set('media', 'music');
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', '25');
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('music provider unavailable');
  const payload = await response.json();
  const seen = new Set<string>();
  return (payload.results ?? []).flatMap((result: Record<string, unknown>) => ['artist', 'song', 'album'].flatMap((type) => {
    const item = normalise(result, type as 'artist' | 'song' | 'album');
    if (!item || seen.has(item.providerObjectId)) return [];
    seen.add(item.providerObjectId);
    return [item];
  }));
}

async function providerLookup(providerObjectId: string) {
  const [type, rawId] = providerObjectId.split(':');
  if (!['artist', 'song', 'album'].includes(type) || !/^\d+$/.test(rawId ?? '')) throw new Error('invalid provider object');
  const url = new URL('https://itunes.apple.com/lookup');
  url.searchParams.set('id', rawId);
  url.searchParams.set('entity', 'song');
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('music provider unavailable');
  const payload = await response.json();
  const candidate = (payload.results ?? []).find((result: Record<string, unknown>) => {
    if (type === 'artist') return Number(result.artistId) === Number(rawId);
    if (type === 'album') return Number(result.collectionId) === Number(rawId);
    return Number(result.trackId) === Number(rawId);
  });
  return candidate ? normalise(candidate, type as 'artist' | 'song' | 'album') : null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return json({ error: 'authentication_required' }, 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: auth, error: authError } = await caller.auth.getUser();
    if (authError || !auth.user) return json({ error: 'authentication_required' }, 401);
    const body = await request.json();

    if (body.action === 'search') {
      const query = String(body.query ?? '').trim();
      if (query.length < 2 || query.length > 80) return json({ error: 'invalid_query' }, 400);
      return json({ items: await providerSearch(query) });
    }

    if (body.action === 'save') {
      const roles = Array.isArray(body.identityRoles) ? [...new Set(body.identityRoles.map(String))] : [];
      if (roles.some((role) => !allowedRoles.has(role))) return json({ error: 'invalid_identity_role' }, 400);
      const verified = await providerLookup(String(body.providerObjectId ?? ''));
      if (!verified) return json({ error: 'provider_object_not_found' }, 404);
      const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
      let { data: object } = await admin.from('taste_objects').select('id').eq('provider', verified.provider).eq('provider_object_id', verified.providerObjectId).maybeSingle();
      if (!object) {
        const { data, error } = await admin.from('taste_objects').insert({
          category: 'music', provider: verified.provider, provider_object_id: verified.providerObjectId,
          title: verified.title, creator_name: verified.creatorName, image_url: verified.imageUrl,
          release_year: verified.releaseYear, object_type: verified.objectType,
        }).select('id').single();
        if (error) throw error;
        object = data;
      }
      const { data: shelf, error: shelfError } = await admin.from('user_taste_objects').insert({
        user_id: auth.user.id, taste_object_id: object.id,
        relationship_type: verified.objectType === 'song' ? 'currently_into' : 'favourite',
        visibility: 'private', use_for_matching: false, identity_roles: roles,
      }).select('id').single();
      if (shelfError?.code === '23505') return json({ error: 'duplicate_object' }, 409);
      if (shelfError) throw shelfError;
      return json({ shelfItemId: shelf.id }, 201);
    }

    return json({ error: 'unknown_action' }, 400);
  } catch {
    return json({ error: 'music_catalog_failed' }, 500);
  }
});
