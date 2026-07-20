import { requireBackendClient } from './client';

export type ShelfItem = {
  id: string;
  category: string;
  title: string;
  creatorName: string | null;
  relationshipType: string;
  emotionalMeaning: string | null;
  visibility: 'private' | 'connections' | 'profile';
  useForMatching: boolean;
  objectType: string;
  personalNote: string | null;
  identityRoles: string[];
  privacyReviewedAt: string | null;
  position: number;
};

export async function getShelf(): Promise<ShelfItem[]> {
  const client = requireBackendClient();
  const { data: links, error: linksError } = await client.from('user_taste_objects')
    .select('id,taste_object_id,relationship_type,personal_note,emotional_meaning,visibility,use_for_matching,position,identity_roles,privacy_reviewed_at,created_at')
    .order('position').order('created_at');
  if (linksError) throw linksError;
  if (!links?.length) return [];

  const { data: objects, error: objectsError } = await client.from('taste_objects')
    .select('id,category,title,creator_name,object_type').in('id', links.map((link) => link.taste_object_id));
  if (objectsError) throw objectsError;
  const byId = new Map((objects ?? []).map((object) => [object.id, object]));

  return links.flatMap((link) => {
    const object = byId.get(link.taste_object_id);
    if (!object) return [];
    return [{
      id: link.id,
      category: object.category,
      title: object.title,
      creatorName: object.creator_name,
      relationshipType: link.relationship_type,
      emotionalMeaning: link.emotional_meaning,
      visibility: link.visibility as ShelfItem['visibility'],
      useForMatching: link.use_for_matching,
      objectType: object.object_type,
      personalNote: link.personal_note,
      identityRoles: link.identity_roles,
      privacyReviewedAt: link.privacy_reviewed_at,
      position: link.position,
    }];
  });
}

export async function addManualShelfItem(input: {
  category: string;
  title: string;
  creatorName?: string;
  emotionalMeaning?: string;
}): Promise<void> {
  const client = requireBackendClient();
  const { error } = await client.rpc('add_manual_taste_object', {
    p_category: input.category,
    p_title: input.title,
    p_creator_name: input.creatorName?.trim() || null,
    p_relationship_type: 'comfort_object',
    p_emotional_meaning: input.emotionalMeaning?.trim() || null,
  });
  if (error) throw error;
}

export async function removeShelfItem(id: string): Promise<void> {
  const client = requireBackendClient();
  const { error } = await client.rpc('remove_shelf_item', { p_shelf_item_id: id });
  if (error) throw error;
}
