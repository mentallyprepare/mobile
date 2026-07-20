export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type DraftRow = {
  id: string;
  ritual_id: string;
  author_id: string;
  night: number;
  content: string;
  client_revision: number;
  server_revision: number;
  created_at: string;
  updated_at: string;
};

type SealedEntryRow = {
  id: string;
  ritual_id: string;
  author_id: string;
  night: number;
  content: string;
  source_draft_id: string;
  idempotency_key: string;
  sealed_at: string;
};

type TasteObjectRow = {
  id: string;
  category: string;
  provider: string;
  provider_object_id: string | null;
  title: string;
  subtitle: string | null;
  creator_name: string | null;
  description: string | null;
  image_url: string | null;
  release_year: number | null;
  metadata_json: Json;
  created_at: string;
};

type UserTasteObjectRow = {
  id: string;
  user_id: string;
  taste_object_id: string;
  relationship_type: string;
  personal_note: string | null;
  emotional_meaning: string | null;
  context_prompt: string | null;
  visibility: string;
  use_for_matching: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

/** Checked-in contract for rows available to the untrusted mobile client. */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { user_id: string; anonymous_name: string; locale: string; timezone: string; profile_visibility: string; discovery_enabled: boolean; onboarding_completed: boolean; created_at: string; updated_at: string };
        Insert: { user_id: string; anonymous_name: string; locale?: string; timezone?: string; profile_visibility?: string; discovery_enabled?: boolean; onboarding_completed?: boolean };
        Update: { anonymous_name?: string; locale?: string; timezone?: string; profile_visibility?: string; discovery_enabled?: boolean; onboarding_completed?: boolean };
        Relationships: [];
      };
      taste_categories: {
        Row: { id: string; label: string; position: number };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      taste_objects: {
        Row: TasteObjectRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      user_taste_objects: {
        Row: UserTasteObjectRow;
        Insert: never;
        Update: { relationship_type?: string; personal_note?: string | null; emotional_meaning?: string | null; context_prompt?: string | null; visibility?: string; use_for_matching?: boolean; position?: number };
        Relationships: [];
      };
      onboarding_sessions: {
        Row: { user_id: string; current_step: string; completed_steps: string[]; draft_data: Json; started_at: string; updated_at: string; completed_at: string | null };
        Insert: { user_id: string; current_step?: string; completed_steps?: string[]; draft_data?: Json; completed_at?: string | null };
        Update: { current_step?: string; completed_steps?: string[]; draft_data?: Json; completed_at?: string | null };
        Relationships: [];
      };
      match_memberships: {
        Row: { id: string; match_id: string; user_id: string; partner_id: string; partner_pseudonym: string; state: string; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      rituals: {
        Row: { id: string; match_id: string; state: string; starts_on: string; current_night: number; created_at: string; updated_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      daily_prompts: {
        Row: { id: string; prompt_set_version: string; night: number; prompt: string; active: boolean; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      writing_drafts: { Row: DraftRow; Insert: never; Update: never; Relationships: [] };
      sealed_entries: { Row: SealedEntryRow; Insert: never; Update: never; Relationships: [] };
      partner_presence: {
        Row: { ritual_id: string; user_id: string; night: number; has_sealed: boolean; recorded_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_draft: {
        Args: { p_draft_id: string; p_ritual_id: string; p_night: number; p_content: string; p_client_revision: number; p_expected_server_revision?: number | null };
        Returns: DraftRow;
      };
      seal_entry: { Args: { p_draft_id: string; p_idempotency_key: string }; Returns: SealedEntryRow };
      block_user: { Args: { p_blocked_user_id: string }; Returns: undefined };
      add_manual_taste_object: {
        Args: { p_category: string; p_title: string; p_creator_name: string | null; p_relationship_type: string; p_emotional_meaning?: string | null };
        Returns: UserTasteObjectRow;
      };
      remove_shelf_item: { Args: { p_shelf_item_id: string }; Returns: undefined };
      complete_initial_account_setup: {
        Args: { p_anonymous_name: string; p_age_confirmed: boolean; p_terms_accepted: boolean; p_privacy_accepted: boolean };
        Returns: Database['public']['Tables']['profiles']['Row'];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type WritingDraft = DraftRow;
export type SealedEntry = SealedEntryRow;
export type TasteObject = TasteObjectRow;
export type UserTasteObject = UserTasteObjectRow;
