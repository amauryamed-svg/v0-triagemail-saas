export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          created_at: string
          details: Json | null
          drafts_created: number
          duration_ms: number | null
          emails_processed: number
          id: string
          run_type: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          drafts_created?: number
          duration_ms?: number | null
          emails_processed?: number
          id?: string
          run_type: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          drafts_created?: number
          duration_ms?: number | null
          emails_processed?: number
          id?: string
          run_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          instagram_handle: string | null
          is_vip: boolean
          last_push_at: string | null
          last_push_channel: string | null
          name: string | null
          push_count: number
          user_id: string
          whatsapp_phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          is_vip?: boolean
          last_push_at?: string | null
          last_push_channel?: string | null
          name?: string | null
          push_count?: number
          user_id: string
          whatsapp_phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          is_vip?: boolean
          last_push_at?: string | null
          last_push_channel?: string | null
          name?: string | null
          push_count?: number
          user_id?: string
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          approved_at: string | null
          awaiting_approval: boolean
          body: string
          created_at: string
          email_id: string
          emily_briefing: string | null
          gmail_draft_id: string | null
          id: string
          mode_generated: string
          rejected_at: string | null
          sent_at: string | null
          user_id: string
          voice_duration_ms: number | null
          voice_note_url: string | null
        }
        Insert: {
          approved_at?: string | null
          awaiting_approval?: boolean
          body: string
          created_at?: string
          email_id: string
          emily_briefing?: string | null
          gmail_draft_id?: string | null
          id?: string
          mode_generated: string
          rejected_at?: string | null
          sent_at?: string | null
          user_id: string
          voice_duration_ms?: number | null
          voice_note_url?: string | null
        }
        Update: {
          approved_at?: string | null
          awaiting_approval?: boolean
          body?: string
          created_at?: string
          email_id?: string
          emily_briefing?: string | null
          gmail_draft_id?: string | null
          id?: string
          mode_generated?: string
          rejected_at?: string | null
          sent_at?: string | null
          user_id?: string
          voice_duration_ms?: number | null
          voice_note_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drafts_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          applied_heuristics: Json | null
          attachments_json: Json | null
          created_at: string
          deadline_detected_at: string | null
          eisenhower: string | null
          from_email: string | null
          from_name: string | null
          gmail_msg_id: string
          gmail_thread_id: string
          id: string
          importance: number
          priority_score: number
          received_at: string | null
          snippet: string | null
          status: string
          subject: string | null
          summary_150: string | null
          triaged_at: string | null
          urgency: string
          user_id: string
        }
        Insert: {
          applied_heuristics?: Json | null
          attachments_json?: Json | null
          created_at?: string
          deadline_detected_at?: string | null
          eisenhower?: string | null
          from_email?: string | null
          from_name?: string | null
          gmail_msg_id: string
          gmail_thread_id: string
          id?: string
          importance?: number
          priority_score?: number
          received_at?: string | null
          snippet?: string | null
          status?: string
          subject?: string | null
          summary_150?: string | null
          triaged_at?: string | null
          urgency?: string
          user_id: string
        }
        Update: {
          applied_heuristics?: Json | null
          attachments_json?: Json | null
          created_at?: string
          deadline_detected_at?: string | null
          eisenhower?: string | null
          from_email?: string | null
          from_name?: string | null
          gmail_msg_id?: string
          gmail_thread_id?: string
          id?: string
          importance?: number
          priority_score?: number
          received_at?: string | null
          snippet?: string | null
          status?: string
          subject?: string | null
          summary_150?: string | null
          triaged_at?: string | null
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_rules: {
        Row: {
          auto_draft: boolean
          auto_voice_note: boolean
          conditions: Json
          created_at: string
          enabled: boolean
          id: string
          name: string
          priority_boost: number
          trigger_count: number
          trigger_type: string
          user_id: string
        }
        Insert: {
          auto_draft?: boolean
          auto_voice_note?: boolean
          conditions?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          priority_boost?: number
          trigger_count?: number
          trigger_type: string
          user_id: string
        }
        Update: {
          auto_draft?: boolean
          auto_voice_note?: boolean
          conditions?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          priority_boost?: number
          trigger_count?: number
          trigger_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          agent_active: boolean
          created_at: string
          elevenlabs_voice_id: string | null
          email: string
          gmail_access_token: string | null
          gmail_refresh_token: string | null
          gmail_token_expires_at: string | null
          id: string
          image_url: string | null
          mode_default: string
          name: string | null
          updated_at: string
        }
        Insert: {
          agent_active?: boolean
          created_at?: string
          elevenlabs_voice_id?: string | null
          email: string
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          gmail_token_expires_at?: string | null
          id?: string
          image_url?: string | null
          mode_default?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          agent_active?: boolean
          created_at?: string
          elevenlabs_voice_id?: string | null
          email?: string
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          gmail_token_expires_at?: string | null
          id?: string
          image_url?: string | null
          mode_default?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"]
