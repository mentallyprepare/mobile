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

/** Checked-in contract for rows available to the untrusted mobile client. */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { user_id: string; anonymous_name: string; locale: string; timezone: string; created_at: string; updated_at: string };
        Insert: { user_id: string; anonymous_name: string; locale?: string; timezone?: string };
        Update: { anonymous_name?: string; locale?: string; timezone?: string };
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type WritingDraft = DraftRow;
export type SealedEntry = SealedEntryRow;
