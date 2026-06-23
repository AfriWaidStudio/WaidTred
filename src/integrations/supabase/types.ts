export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          clicks: number
          code: string
          conversions: number
          created_at: string
          earnings: number
          id: string
          user_id: string
        }
        Insert: {
          clicks?: number
          code: string
          conversions?: number
          created_at?: string
          earnings?: number
          id?: string
          user_id: string
        }
        Update: {
          clicks?: number
          code?: string
          conversions?: number
          created_at?: string
          earnings?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["alert_severity"] | null
          target_id: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          target_id?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
          target_id?: string | null
          title?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          scopes: string[] | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          scopes?: string[] | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: string[] | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      bill_payments: {
        Row: {
          account_number: string
          amount: number
          biller: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          biller: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          biller?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          allocated: number
          budget_id: string
          category: string
          id: string
          spent: number
          user_id: string
        }
        Insert: {
          allocated: number
          budget_id: string
          category: string
          id?: string
          spent?: number
          user_id: string
        }
        Update: {
          allocated?: number
          budget_id?: string
          category?: string
          id?: string
          spent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string
          id: string
          month: string
          total_budget: number
          total_spent: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          total_budget: number
          total_spent?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          total_budget?: number
          total_spent?: number
          user_id?: string
        }
        Relationships: []
      }
      causes: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          goal_amount: number
          id: string
          organizer_id: string
          raised_amount: number
          status: string
          title: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          goal_amount: number
          id?: string
          organizer_id: string
          raised_amount?: number
          status?: string
          title: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          goal_amount?: number
          id?: string
          organizer_id?: string
          raised_amount?: number
          status?: string
          title?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          role: string
          tool_calls: Json | null
          tool_name: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          tool_calls?: Json | null
          tool_name?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          tool_calls?: Json | null
          tool_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_thread_messages: {
        Row: {
          attachment_data: Json | null
          attachment_type: string | null
          body: string | null
          created_at: string
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          attachment_data?: Json | null
          attachment_type?: string | null
          body?: string | null
          created_at?: string
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          attachment_data?: Json | null
          attachment_type?: string | null
          body?: string | null
          created_at?: string
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: []
      }
      chat_thread_participants: {
        Row: {
          id: string
          joined_at: string
          last_read_at: string | null
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_read_at?: string | null
          thread_id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_threads: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          last_message_at: string
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          last_message_at?: string
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          last_message_at?: string
          title?: string | null
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          circle_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
        }
        Relationships: []
      }
      civilization_metrics_daily: {
        Row: {
          active_smaibeings: number
          active_tredbeings: number
          computed_at: string
          economic_growth: number
          snapshot_date: string
          total_entities: number
          total_maiki: number
          total_onyix: number
          total_smaisika: number
          total_transactions: number
          total_treasuries: number
          total_users: number
        }
        Insert: {
          active_smaibeings?: number
          active_tredbeings?: number
          computed_at?: string
          economic_growth?: number
          snapshot_date: string
          total_entities?: number
          total_maiki?: number
          total_onyix?: number
          total_smaisika?: number
          total_transactions?: number
          total_treasuries?: number
          total_users?: number
        }
        Update: {
          active_smaibeings?: number
          active_tredbeings?: number
          computed_at?: string
          economic_growth?: number
          snapshot_date?: string
          total_entities?: number
          total_maiki?: number
          total_onyix?: number
          total_smaisika?: number
          total_transactions?: number
          total_treasuries?: number
          total_users?: number
        }
        Relationships: []
      }
      contacts: {
        Row: {
          avatar_url: string | null
          contact_user_id: string | null
          created_at: string
          email: string | null
          id: string
          is_favorite: boolean
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          contact_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          contact_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cooperative_members: {
        Row: {
          coop_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["coop_role"]
          user_id: string
        }
        Insert: {
          coop_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["coop_role"]
          user_id: string
        }
        Update: {
          coop_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["coop_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_members_coop_id_fkey"
            columns: ["coop_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_treasuries: {
        Row: {
          balance: number
          coop_id: string
          governance: Json | null
          id: string
          total_contributions: number
          total_disbursed: number
          updated_at: string
        }
        Insert: {
          balance?: number
          coop_id: string
          governance?: Json | null
          id?: string
          total_contributions?: number
          total_disbursed?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          coop_id?: string
          governance?: Json | null
          id?: string
          total_contributions?: number
          total_disbursed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_treasuries_coop_id_fkey"
            columns: ["coop_id"]
            isOneToOne: true
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_vote_choices: {
        Row: {
          choice: string
          created_at: string
          id: string
          user_id: string
          vote_id: string
        }
        Insert: {
          choice: string
          created_at?: string
          id?: string
          user_id: string
          vote_id: string
        }
        Update: {
          choice?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_vote_choices_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "cooperative_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_votes: {
        Row: {
          closes_at: string | null
          coop_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          status: string
          title: string
        }
        Insert: {
          closes_at?: string | null
          coop_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          status?: string
          title: string
        }
        Update: {
          closes_at?: string | null
          coop_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_votes_coop_id_fkey"
            columns: ["coop_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperatives: {
        Row: {
          created_at: string
          description: string | null
          entity_id: string | null
          founder_id: string
          id: string
          kind: Database["public"]["Enums"]["cooperative_kind"]
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_id?: string | null
          founder_id: string
          id?: string
          kind: Database["public"]["Enums"]["cooperative_kind"]
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_id?: string | null
          founder_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["cooperative_kind"]
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperatives_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: true
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          currency_code: string
          flag_emoji: string | null
          fx_to_smk: number
          id: string
          is_enabled: boolean
          name: string
        }
        Insert: {
          code: string
          currency_code: string
          flag_emoji?: string | null
          fx_to_smk?: number
          id?: string
          is_enabled?: boolean
          name: string
        }
        Update: {
          code?: string
          currency_code?: string
          flag_emoji?: string | null
          fx_to_smk?: number
          id?: string
          is_enabled?: boolean
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          level: string | null
          title: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          title: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          title?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          created_at: string
          description: string | null
          evidence_url: string | null
          id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          evidence_url?: string | null
          id?: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          evidence_url?: string | null
          id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          anonymous: boolean
          cause_id: string
          created_at: string
          donor_id: string
          id: string
          message: string | null
        }
        Insert: {
          amount: number
          anonymous?: boolean
          cause_id: string
          created_at?: string
          donor_id: string
          id?: string
          message?: string | null
        }
        Update: {
          amount?: number
          anonymous?: boolean
          cause_id?: string
          created_at?: string
          donor_id?: string
          id?: string
          message?: string | null
        }
        Relationships: []
      }
      economic_missions: {
        Row: {
          category: string
          claims_count: number
          created_at: string
          creator_id: string
          description: string
          expires_at: string | null
          id: string
          max_claims: number | null
          reward: number
          status: string
          title: string
          verification_type: string
        }
        Insert: {
          category: string
          claims_count?: number
          created_at?: string
          creator_id: string
          description: string
          expires_at?: string | null
          id?: string
          max_claims?: number | null
          reward: number
          status?: string
          title: string
          verification_type?: string
        }
        Update: {
          category?: string
          claims_count?: number
          created_at?: string
          creator_id?: string
          description?: string
          expires_at?: string | null
          id?: string
          max_claims?: number | null
          reward?: number
          status?: string
          title?: string
          verification_type?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_pct: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_pct?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_pct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_treasuries: {
        Row: {
          balance: number
          budget_monthly: number | null
          created_at: string
          entity_id: string
          expense_total: number
          id: string
          reserve_allocation: number
          revenue_total: number
          updated_at: string
        }
        Insert: {
          balance?: number
          budget_monthly?: number | null
          created_at?: string
          entity_id: string
          expense_total?: number
          id?: string
          reserve_allocation?: number
          revenue_total?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          budget_monthly?: number | null
          created_at?: string
          entity_id?: string
          expense_total?: number
          id?: string
          reserve_allocation?: number
          revenue_total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_treasuries_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: true
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_treasury_movements: {
        Row: {
          actor_id: string | null
          amount: number
          category: string
          created_at: string
          description: string | null
          direction: string
          entity_id: string
          id: string
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          actor_id?: string | null
          amount: number
          category: string
          created_at?: string
          description?: string | null
          direction: string
          entity_id: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          actor_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          direction?: string
          entity_id?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_treasury_movements_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_deals: {
        Row: {
          amount: number
          buyer_confirmed: boolean | null
          buyer_id: string
          created_at: string
          description: string | null
          id: string
          released_at: string | null
          seller_confirmed: boolean | null
          seller_id: string
          status: string
        }
        Insert: {
          amount: number
          buyer_confirmed?: boolean | null
          buyer_id: string
          created_at?: string
          description?: string | null
          id?: string
          released_at?: string | null
          seller_confirmed?: boolean | null
          seller_id: string
          status?: string
        }
        Update: {
          amount?: number
          buyer_confirmed?: boolean | null
          buyer_id?: string
          created_at?: string
          description?: string | null
          id?: string
          released_at?: string | null
          seller_confirmed?: boolean | null
          seller_id?: string
          status?: string
        }
        Relationships: []
      }
      event_tickets: {
        Row: {
          buyer_id: string
          created_at: string
          event_id: string
          id: string
          scanned_at: string | null
          status: string
          ticket_code: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          event_id: string
          id?: string
          scanned_at?: string | null
          status?: string
          ticket_code: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          event_id?: string
          id?: string
          scanned_at?: string | null
          status?: string
          ticket_code?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          organizer_id: string
          price: number
          starts_at: string
          status: string
          tickets_sold: number
          title: string
          venue: string | null
        }
        Insert: {
          capacity?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          organizer_id: string
          price?: number
          starts_at: string
          status?: string
          tickets_sold?: number
          title: string
          venue?: string | null
        }
        Update: {
          capacity?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          organizer_id?: string
          price?: number
          starts_at?: string
          status?: string
          tickets_sold?: number
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      expense_entries: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          group_id: string
          id: string
          paid_by: string
          split_among: string[]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          paid_by: string
          split_among: string[]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          paid_by?: string
          split_among?: string[]
        }
        Relationships: []
      }
      expense_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          entity_id: string | null
          head_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          head_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          head_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "families_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: true
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["family_role"]
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["family_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_treasuries: {
        Row: {
          balance: number
          family_id: string
          id: string
          rules: Json | null
          shared_insurance: number
          shared_investments: number
          shared_savings: number
          updated_at: string
        }
        Insert: {
          balance?: number
          family_id: string
          id?: string
          rules?: Json | null
          shared_insurance?: number
          shared_investments?: number
          shared_savings?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          family_id?: string
          id?: string
          rules?: Json | null
          shared_insurance?: number
          shared_investments?: number
          shared_savings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_treasuries_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      flagged_content: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          reason: string
          reporter_id: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          reason: string
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      flash_deals: {
        Row: {
          discount_pct: number
          ends_at: string
          id: string
          is_active: boolean
          product_id: string
          starts_at: string
          stock_left: number
        }
        Insert: {
          discount_pct: number
          ends_at: string
          id?: string
          is_active?: boolean
          product_id: string
          starts_at?: string
          stock_left: number
        }
        Update: {
          discount_pct?: number
          ends_at?: string
          id?: string
          is_active?: boolean
          product_id?: string
          starts_at?: string
          stock_left?: number
        }
        Relationships: []
      }
      fraud_events: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          resolved: boolean | null
          severity: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          resolved?: boolean | null
          severity: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          resolved?: boolean | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      funding_requests: {
        Row: {
          agent_id: string | null
          agent_notes: string | null
          amount: number
          created_at: string
          id: string
          method: string
          processed_at: string | null
          proof_url: string | null
          reference_note: string | null
          status: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          agent_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          method: string
          processed_at?: string | null
          proof_url?: string | null
          reference_note?: string | null
          status?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          agent_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string
          processed_at?: string | null
          proof_url?: string | null
          reference_note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      fx_quotes: {
        Row: {
          base: string
          change_24h: number | null
          id: string
          quote: string
          rate: number
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          base: string
          change_24h?: number | null
          id?: string
          quote: string
          rate: number
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          base?: string
          change_24h?: number | null
          id?: string
          quote?: string
          rate?: number
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      group_contributions: {
        Row: {
          amount: number
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_contributions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "savings_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "savings_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          coverage_amount: number
          created_at: string
          ends_at: string | null
          id: string
          monthly_premium: number
          policy_type: string
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          coverage_amount: number
          created_at?: string
          ends_at?: string | null
          id?: string
          monthly_premium: number
          policy_type: string
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          coverage_amount?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          monthly_premium?: number
          policy_type?: string
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key_name: string | null
          config: Json | null
          created_at: string | null
          endpoint: string | null
          id: string
          last_tested: string | null
          provider_name: string
          region: string | null
          service_type: string
          status: Database["public"]["Enums"]["integration_status"] | null
          updated_at: string | null
        }
        Insert: {
          api_key_name?: string | null
          config?: Json | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          last_tested?: string | null
          provider_name: string
          region?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
        }
        Update: {
          api_key_name?: string | null
          config?: Json | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          last_tested?: string | null
          provider_name?: string
          region?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["integration_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      investment_baskets: {
        Row: {
          asset_class: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          nav: number
          risk_level: string
          ytd_return: number | null
        }
        Insert: {
          asset_class: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nav?: number
          risk_level?: string
          ytd_return?: number | null
        }
        Update: {
          asset_class?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nav?: number
          risk_level?: string
          ytd_return?: number | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
          user_id: string
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_price: number
          user_id: string
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_email: string | null
          client_name: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          status: string
          total: number
          user_id: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          bid_amount: number | null
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: string
        }
        Insert: {
          applicant_id: string
          bid_amount?: number | null
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: string
        }
        Update: {
          applicant_id?: string
          bid_amount?: number | null
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          assigned_to: string | null
          budget: number
          category: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          poster_id: string
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          budget: number
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          poster_id: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          budget?: number
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          poster_id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      konsmik_entities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_core: boolean
          kind: Database["public"]["Enums"]["entity_kind"]
          metadata: Json | null
          name: string
          owner_id: string | null
          parent_entity_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_core?: boolean
          kind: Database["public"]["Enums"]["entity_kind"]
          metadata?: Json | null
          name: string
          owner_id?: string | null
          parent_entity_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_core?: boolean
          kind?: Database["public"]["Enums"]["entity_kind"]
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          parent_entity_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "konsmik_entities_parent_entity_id_fkey"
            columns: ["parent_entity_id"]
            isOneToOne: false
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      konsnet_edges: {
        Row: {
          created_at: string
          from_entity: string
          id: string
          metadata: Json | null
          relationship: string
          to_entity: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          from_entity: string
          id?: string
          metadata?: Json | null
          relationship: string
          to_entity: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          from_entity?: string
          id?: string
          metadata?: Json | null
          relationship?: string
          to_entity?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "konsnet_edges_from_entity_fkey"
            columns: ["from_entity"]
            isOneToOne: false
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "konsnet_edges_to_entity_fkey"
            columns: ["to_entity"]
            isOneToOne: false
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          document_number: string | null
          document_type: string
          document_url: string | null
          full_name: string | null
          id: string
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_number?: string | null
          document_type: string
          document_url?: string | null
          full_name?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          document_number?: string | null
          document_type?: string
          document_url?: string | null
          full_name?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          body: string | null
          course_id: string
          id: string
          position: number
          title: string
          video_url: string | null
        }
        Insert: {
          body?: string | null
          course_id: string
          id?: string
          position?: number
          title: string
          video_url?: string | null
        }
        Update: {
          body?: string | null
          course_id?: string
          id?: string
          position?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          approved_by: string | null
          balance: number
          created_at: string
          id: string
          interest_rate: number
          monthly_payment: number
          principal: number
          purpose: string | null
          status: string
          term_months: number
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          balance: number
          created_at?: string
          id?: string
          interest_rate: number
          monthly_payment: number
          principal: number
          purpose?: string | null
          status?: string
          term_months: number
          user_id: string
        }
        Update: {
          approved_by?: string | null
          balance?: number
          created_at?: string
          id?: string
          interest_rate?: number
          monthly_payment?: number
          principal?: number
          purpose?: string | null
          status?: string
          term_months?: number
          user_id?: string
        }
        Relationships: []
      }
      merchants: {
        Row: {
          business_name: string
          category: string | null
          created_at: string
          id: string
          kyb_status: string
          owner_id: string
          registration_number: string | null
        }
        Insert: {
          business_name: string
          category?: string | null
          created_at?: string
          id?: string
          kyb_status?: string
          owner_id: string
          registration_number?: string | null
        }
        Update: {
          business_name?: string
          category?: string | null
          created_at?: string
          id?: string
          kyb_status?: string
          owner_id?: string
          registration_number?: string | null
        }
        Relationships: []
      }
      mission_claims: {
        Row: {
          claimant_id: string
          created_at: string
          id: string
          mission_id: string
          paid_amount: number | null
          processed_at: string | null
          proof: Json | null
          status: string
          verified_by: string | null
        }
        Insert: {
          claimant_id: string
          created_at?: string
          id?: string
          mission_id: string
          paid_amount?: number | null
          processed_at?: string | null
          proof?: Json | null
          status?: string
          verified_by?: string | null
        }
        Update: {
          claimant_id?: string
          created_at?: string
          id?: string
          mission_id?: string
          paid_amount?: number | null
          processed_at?: string | null
          proof?: Json | null
          status?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_claims_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "economic_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string
          description: string | null
          goal_target: number
          goal_type: string
          id: string
          is_active: boolean | null
          reward_amount: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_target: number
          goal_type: string
          id?: string
          is_active?: boolean | null
          reward_amount: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_target?: number
          goal_type?: string
          id?: string
          is_active?: boolean | null
          reward_amount?: number
          title?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          body: string | null
          category: string | null
          cover_url: string | null
          id: string
          is_breaking: boolean | null
          published_at: string
          source: string | null
          title: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          cover_url?: string | null
          id?: string
          is_breaking?: boolean | null
          published_at?: string
          source?: string | null
          title: string
        }
        Update: {
          body?: string | null
          category?: string | null
          cover_url?: string | null
          id?: string
          is_breaking?: boolean | null
          published_at?: string
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onyix_movements: {
        Row: {
          action: string
          actor_id: string | null
          amount: number
          created_at: string
          entity_id: string | null
          id: string
          meta: Json | null
          reason: string | null
          reserve_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          amount: number
          created_at?: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          reason?: string | null
          reserve_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          amount?: number
          created_at?: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          reason?: string | null
          reserve_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onyix_movements_reserve_id_fkey"
            columns: ["reserve_id"]
            isOneToOne: false
            referencedRelation: "onyix_reserves"
            referencedColumns: ["id"]
          },
        ]
      }
      onyix_reserves: {
        Row: {
          allocated: number
          burned: number
          circulating: number
          created_at: string
          id: string
          name: string
          notes: string | null
          symbol: string
          total_supply: number
          updated_at: string
        }
        Insert: {
          allocated?: number
          burned?: number
          circulating?: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          symbol?: string
          total_supply?: number
          updated_at?: string
        }
        Update: {
          allocated?: number
          burned?: number
          circulating?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          symbol?: string
          total_supply?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          payer_contact: string | null
          payer_id: string | null
          reason: string | null
          requester_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payer_contact?: string | null
          payer_id?: string | null
          reason?: string | null
          requester_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payer_contact?: string | null
          payer_id?: string | null
          reason?: string | null
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      payroll_employees: {
        Row: {
          employee_name: string
          employee_user_id: string | null
          employer_id: string
          id: string
          paid: boolean | null
          role: string | null
          run_id: string | null
          salary: number
        }
        Insert: {
          employee_name: string
          employee_user_id?: string | null
          employer_id: string
          id?: string
          paid?: boolean | null
          role?: string | null
          run_id?: string | null
          salary: number
        }
        Update: {
          employee_name?: string
          employee_user_id?: string | null
          employer_id?: string
          id?: string
          paid?: boolean | null
          role?: string | null
          run_id?: string | null
          salary?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employees_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          employer_id: string
          id: string
          period: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          employer_id: string
          id?: string
          period: string
          status?: string
          total_amount: number
        }
        Update: {
          created_at?: string
          employer_id?: string
          id?: string
          period?: string
          status?: string
          total_amount?: number
        }
        Relationships: []
      }
      pensions: {
        Row: {
          balance: number
          created_at: string
          employer_match_pct: number | null
          id: string
          monthly_contribution: number
          retirement_age: number | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          employer_match_pct?: number | null
          id?: string
          monthly_contribution?: number
          retirement_age?: number | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          employer_match_pct?: number | null
          id?: string
          monthly_contribution?: number
          retirement_age?: number | null
          user_id?: string
        }
        Relationships: []
      }
      pos_sales: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          id: string
          merchant_id: string
          method: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          id?: string
          merchant_id: string
          method?: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          id?: string
          merchant_id?: string
          method?: string
          status?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string
          circle_id: string | null
          comment_count: number
          created_at: string
          id: string
          like_count: number
          media_url: string | null
          user_id: string
        }
        Insert: {
          body: string
          circle_id?: string | null
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          media_url?: string | null
          user_id: string
        }
        Update: {
          body?: string
          circle_id?: string | null
          comment_count?: number
          created_at?: string
          id?: string
          like_count?: number
          media_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_markets: {
        Row: {
          category: string | null
          closes_at: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          no_pool: number
          question: string
          resolution: string | null
          status: string
          yes_pool: number
        }
        Insert: {
          category?: string | null
          closes_at: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          no_pool?: number
          question: string
          resolution?: string | null
          status?: string
          yes_pool?: number
        }
        Update: {
          category?: string | null
          closes_at?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          no_pool?: number
          question?: string
          resolution?: string | null
          status?: string
          yes_pool?: number
        }
        Relationships: []
      }
      prediction_positions: {
        Row: {
          amount: number
          created_at: string
          id: string
          market_id: string
          payout: number
          settled: boolean
          side: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          market_id: string
          payout?: number
          settled?: boolean
          side: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          market_id?: string
          payout?: number
          settled?: boolean
          side?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          asset_name: string | null
          asset_type: string
          base_price: number
          created_at: string | null
          id: string
          is_active: boolean | null
          max_price: number | null
          min_price: number | null
          spread_percentage: number
          updated_at: string | null
        }
        Insert: {
          asset_name?: string | null
          asset_type: string
          base_price?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          spread_percentage?: number
          updated_at?: string | null
        }
        Update: {
          asset_name?: string | null
          asset_type?: string
          base_price?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          spread_percentage?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          title: string | null
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          title?: string | null
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          title?: string | null
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"] | null
          avatar_url: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prosperity_allocations: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          id: string
          reason: string | null
          recipient_id: string
          recipient_kind: string
          status: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string
          id?: string
          reason?: string | null
          recipient_id: string
          recipient_kind: string
          status?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          id?: string
          reason?: string | null
          recipient_id?: string
          recipient_kind?: string
          status?: string
        }
        Relationships: []
      }
      prosperity_pool: {
        Row: {
          balance: number
          id: string
          rules: Json | null
          total_contributed: number
          total_disbursed: number
          updated_at: string
        }
        Insert: {
          balance?: number
          id?: string
          rules?: Json | null
          total_contributed?: number
          total_disbursed?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          id?: string
          rules?: Json | null
          total_contributed?: number
          total_disbursed?: number
          updated_at?: string
        }
        Relationships: []
      }
      provider_credentials: {
        Row: {
          created_at: string
          description: string | null
          env_var: string
          id: string
          is_sandbox: boolean
          key_name: string
          provider_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          env_var: string
          id?: string
          is_sandbox?: boolean
          key_name: string
          provider_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          env_var?: string
          id?: string
          is_sandbox?: boolean
          key_name?: string
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_credentials_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_logs: {
        Row: {
          created_at: string
          direction: string
          endpoint: string | null
          error: string | null
          id: string
          latency_ms: number | null
          method: string | null
          provider_id: string | null
          reference: string | null
          request_payload: Json | null
          response_payload: Json | null
          service_kind:
            | Database["public"]["Enums"]["provider_service_kind"]
            | null
          status_code: number | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          direction?: string
          endpoint?: string | null
          error?: string | null
          id?: string
          latency_ms?: number | null
          method?: string | null
          provider_id?: string | null
          reference?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          service_kind?:
            | Database["public"]["Enums"]["provider_service_kind"]
            | null
          status_code?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          endpoint?: string | null
          error?: string | null
          id?: string
          latency_ms?: number | null
          method?: string | null
          provider_id?: string | null
          reference?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          service_kind?:
            | Database["public"]["Enums"]["provider_service_kind"]
            | null
          status_code?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_routes: {
        Row: {
          conditions: Json
          country: string
          created_at: string
          enabled: boolean
          id: string
          priority: number
          provider_id: string
          service_kind: Database["public"]["Enums"]["provider_service_kind"]
          updated_at: string
          weight: number
        }
        Insert: {
          conditions?: Json
          country: string
          created_at?: string
          enabled?: boolean
          id?: string
          priority?: number
          provider_id: string
          service_kind: Database["public"]["Enums"]["provider_service_kind"]
          updated_at?: string
          weight?: number
        }
        Update: {
          conditions?: Json
          country?: string
          created_at?: string
          enabled?: boolean
          id?: string
          priority?: number
          provider_id?: string
          service_kind?: Database["public"]["Enums"]["provider_service_kind"]
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "provider_routes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          fee_flat: number
          fee_percent: number
          id: string
          max_amount: number | null
          min_amount: number
          provider_id: string
          service_kind: Database["public"]["Enums"]["provider_service_kind"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          fee_flat?: number
          fee_percent?: number
          id?: string
          max_amount?: number | null
          min_amount?: number
          provider_id: string
          service_kind: Database["public"]["Enums"]["provider_service_kind"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          fee_flat?: number
          fee_percent?: number
          id?: string
          max_amount?: number | null
          min_amount?: number
          provider_id?: string
          service_kind?: Database["public"]["Enums"]["provider_service_kind"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_webhooks: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          event_type: string | null
          headers: Json | null
          id: string
          idempotency_key: string | null
          payload: Json
          processed_at: string | null
          provider_code: string | null
          provider_id: string | null
          related_reference: string | null
          related_user_id: string | null
          signature: string | null
          signature_valid: boolean | null
          status: Database["public"]["Enums"]["webhook_status"]
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          idempotency_key?: string | null
          payload: Json
          processed_at?: string | null
          provider_code?: string | null
          provider_id?: string | null
          related_reference?: string | null
          related_user_id?: string | null
          signature?: string | null
          signature_valid?: boolean | null
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          idempotency_key?: string | null
          payload?: Json
          processed_at?: string | null
          provider_code?: string | null
          provider_id?: string | null
          related_reference?: string | null
          related_user_id?: string | null
          signature?: string | null
          signature_valid?: boolean | null
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Relationships: [
          {
            foreignKeyName: "provider_webhooks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          base_url: string | null
          code: string
          config: Json
          countries: string[]
          created_at: string
          description: string | null
          id: string
          is_sandbox: boolean
          logo_url: string | null
          name: string
          priority: number
          service_kinds: Database["public"]["Enums"]["provider_service_kind"][]
          status: Database["public"]["Enums"]["provider_status"]
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          code: string
          config?: Json
          countries?: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_sandbox?: boolean
          logo_url?: string | null
          name: string
          priority?: number
          service_kinds?: Database["public"]["Enums"]["provider_service_kind"][]
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          code?: string
          config?: Json
          countries?: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_sandbox?: boolean
          logo_url?: string | null
          name?: string
          priority?: number
          service_kinds?: Database["public"]["Enums"]["provider_service_kind"][]
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
        }
        Relationships: []
      }
      recovery_contacts: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          contact_user_id: string | null
          created_at: string
          id: string
          inheritance_share: number | null
          is_heir: boolean
          relationship: string | null
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          contact_user_id?: string | null
          created_at?: string
          id?: string
          inheritance_share?: number | null
          is_heir?: boolean
          relationship?: string | null
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          contact_user_id?: string | null
          created_at?: string
          id?: string
          inheritance_share?: number | null
          is_heir?: boolean
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recovery_requests: {
        Row: {
          approvals_count: number
          approvals_needed: number
          created_at: string
          id: string
          reason: string | null
          resolved_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          approvals_count?: number
          approvals_needed?: number
          created_at?: string
          id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          approvals_count?: number
          approvals_needed?: number
          created_at?: string
          id?: string
          reason?: string | null
          resolved_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_email: string | null
          referred_id: string | null
          referrer_id: string
          reward_amount: number | null
          rewarded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id: string
          reward_amount?: number | null
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id?: string
          reward_amount?: number | null
          rewarded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      rental_bookings: {
        Row: {
          created_at: string
          end_date: string
          id: string
          rental_id: string
          renter_id: string
          start_date: string
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          rental_id: string
          renter_id: string
          start_date: string
          status?: string
          total_amount: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          rental_id?: string
          renter_id?: string
          start_date?: string
          status?: string
          total_amount?: number
        }
        Relationships: []
      }
      rentals: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          daily_rate: number
          deposit: number
          description: string | null
          id: string
          is_available: boolean
          location: string | null
          owner_id: string
          title: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          daily_rate: number
          deposit?: number
          description?: string | null
          id?: string
          is_available?: boolean
          location?: string | null
          owner_id: string
          title: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          daily_rate?: number
          deposit?: number
          description?: string | null
          id?: string
          is_available?: boolean
          location?: string | null
          owner_id?: string
          title?: string
        }
        Relationships: []
      }
      reputation_events: {
        Row: {
          created_at: string
          delta: number
          dimension: string
          id: string
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          dimension: string
          id?: string
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          dimension?: string
          id?: string
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reputation_scores: {
        Row: {
          contributions: number
          discipline: number
          participation: number
          reliability: number
          total: number
          trust: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contributions?: number
          discipline?: number
          participation?: number
          reliability?: number
          total?: number
          trust?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contributions?: number
          discipline?: number
          participation?: number
          reliability?: number
          total?: number
          trust?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_scores: {
        Row: {
          factors: Json | null
          id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          factors?: Json | null
          id?: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          factors?: Json | null
          id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          auto_contribute_amount: number | null
          auto_contribute_frequency: string | null
          created_at: string
          current_amount: number
          deadline: string | null
          id: string
          name: string
          status: string
          target_amount: number
          user_id: string
        }
        Insert: {
          auto_contribute_amount?: number | null
          auto_contribute_frequency?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          name: string
          status?: string
          target_amount: number
          user_id: string
        }
        Update: {
          auto_contribute_amount?: number | null
          auto_contribute_frequency?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          name?: string
          status?: string
          target_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      savings_groups: {
        Row: {
          contribution_amount: number
          created_at: string
          created_by: string
          description: string | null
          frequency: string
          id: string
          member_count: number
          name: string
          pool_balance: number
          status: string
        }
        Insert: {
          contribution_amount: number
          created_at?: string
          created_by: string
          description?: string | null
          frequency?: string
          id?: string
          member_count?: number
          name: string
          pool_balance?: number
          status?: string
        }
        Update: {
          contribution_amount?: number
          created_at?: string
          created_by?: string
          description?: string | null
          frequency?: string
          id?: string
          member_count?: number
          name?: string
          pool_balance?: number
          status?: string
        }
        Relationships: []
      }
      scheduled_actions: {
        Row: {
          action_type: string
          amount: number | null
          created_at: string
          created_via: string | null
          executed_at: string | null
          id: string
          message: string | null
          result: Json | null
          scheduled_for: string
          status: string
          target_contact: string | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount?: number | null
          created_at?: string
          created_via?: string | null
          executed_at?: string | null
          id?: string
          message?: string | null
          result?: Json | null
          scheduled_for: string
          status?: string
          target_contact?: string | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number | null
          created_at?: string
          created_via?: string | null
          executed_at?: string | null
          id?: string
          message?: string | null
          result?: Json | null
          scheduled_for?: string
          status?: string
          target_contact?: string | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_transfers: {
        Row: {
          active: boolean
          amount: number
          created_at: string
          frequency: string
          id: string
          last_run: string | null
          next_run: string
          recipient_name: string
          recipient_phone: string | null
          recipient_user_id: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          created_at?: string
          frequency: string
          id?: string
          last_run?: string | null
          next_run: string
          recipient_name: string
          recipient_phone?: string | null
          recipient_user_id?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          last_run?: string | null
          next_run?: string
          recipient_name?: string
          recipient_phone?: string | null
          recipient_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string
          eta: string | null
          id: string
          order_id: string | null
          status: string
          tracking_code: string | null
          user_id: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          eta?: string | null
          id?: string
          order_id?: string | null
          status?: string
          tracking_code?: string | null
          user_id: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          eta?: string | null
          id?: string
          order_id?: string | null
          status?: string
          tracking_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      smai_pins: {
        Row: {
          code_hash: string | null
          created_at: string | null
          created_by: string | null
          currency: string
          expires_at: string | null
          id: string
          pin_code: string
          redeemed_at: string | null
          redeemed_by: string | null
          status: string
          value: number
          waideschain_hash: string | null
          waidespruf_signature: string | null
        }
        Insert: {
          code_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          pin_code: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
          value?: number
          waideschain_hash?: string | null
          waidespruf_signature?: string | null
        }
        Update: {
          code_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          pin_code?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
          value?: number
          waideschain_hash?: string | null
          waidespruf_signature?: string | null
        }
        Relationships: []
      }
      sokoplace_inventory: {
        Row: {
          asset_name: string
          asset_type: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          price_in_sika: number
          quantity: number
          status: string
          updated_at: string | null
          value: number
        }
        Insert: {
          asset_name: string
          asset_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          price_in_sika?: number
          quantity?: number
          status?: string
          updated_at?: string | null
          value?: number
        }
        Update: {
          asset_name?: string
          asset_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          price_in_sika?: number
          quantity?: number
          status?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      sokoplace_orders: {
        Row: {
          admin_notes: string | null
          asset_name: string
          asset_type: string
          created_at: string | null
          delivery_data: Json | null
          delivery_status: string
          id: string
          order_type: string
          proof_url: string | null
          quantity: number
          status: string
          total_price: number
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          asset_name: string
          asset_type: string
          created_at?: string | null
          delivery_data?: Json | null
          delivery_status?: string
          id?: string
          order_type?: string
          proof_url?: string | null
          quantity?: number
          status?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          asset_name?: string
          asset_type?: string
          created_at?: string | null
          delivery_data?: Json | null
          delivery_status?: string
          id?: string
          order_type?: string
          proof_url?: string | null
          quantity?: number
          status?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      split_bills: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          status: string
          title: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          status?: string
          title: string
          total_amount: number
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          status?: string
          title?: string
          total_amount?: number
        }
        Relationships: []
      }
      split_participants: {
        Row: {
          bill_id: string
          contact_name: string | null
          id: string
          paid: boolean
          paid_at: string | null
          share: number
          user_id: string | null
        }
        Insert: {
          bill_id: string
          contact_name?: string | null
          id?: string
          paid?: boolean
          paid_at?: string | null
          share: number
          user_id?: string | null
        }
        Update: {
          bill_id?: string
          contact_name?: string | null
          id?: string
          paid?: boolean
          paid_at?: string | null
          share?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_participants_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "split_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      staking_plans: {
        Row: {
          apy: number
          id: string
          is_active: boolean
          min_amount: number
          name: string
          term_days: number
        }
        Insert: {
          apy: number
          id?: string
          is_active?: boolean
          min_amount?: number
          name: string
          term_days: number
        }
        Update: {
          apy?: number
          id?: string
          is_active?: boolean
          min_amount?: number
          name?: string
          term_days?: number
        }
        Relationships: []
      }
      staking_positions: {
        Row: {
          id: string
          last_accrued_date: string | null
          matures_at: string
          plan_id: string
          principal: number
          started_at: string
          status: string
          user_id: string
          yield_earned: number
        }
        Insert: {
          id?: string
          last_accrued_date?: string | null
          matures_at: string
          plan_id: string
          principal: number
          started_at?: string
          status?: string
          user_id: string
          yield_earned?: number
        }
        Update: {
          id?: string
          last_accrued_date?: string | null
          matures_at?: string
          plan_id?: string
          principal?: number
          started_at?: string
          status?: string
          user_id?: string
          yield_earned?: number
        }
        Relationships: []
      }
      storefronts: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          rating: number | null
          slug: string
          status: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          rating?: number | null
          slug: string
          status?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          rating?: number | null
          slug?: string
          status?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          id: string
          merchant_name: string
          next_charge: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          frequency?: string
          id?: string
          merchant_name: string
          next_charge: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          merchant_name?: string
          next_charge?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_setasides: {
        Row: {
          balance: number
          created_at: string
          id: string
          is_active: boolean
          pct: number
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          is_active?: boolean
          pct?: number
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          is_active?: boolean
          pct?: number
          user_id?: string
        }
        Relationships: []
      }
      tip_jars: {
        Row: {
          created_at: string
          display_name: string
          id: string
          message: string | null
          slug: string
          total_received: number
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          message?: string | null
          slug: string
          total_received?: number
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          message?: string | null
          slug?: string
          total_received?: number
          user_id?: string
        }
        Relationships: []
      }
      trade_orders: {
        Row: {
          asset_symbol: string
          created_at: string
          id: string
          price: number
          quantity: number
          side: string
          status: string
          user_id: string
        }
        Insert: {
          asset_symbol: string
          created_at?: string
          id?: string
          price: number
          quantity: number
          side: string
          status?: string
          user_id: string
        }
        Update: {
          asset_symbol?: string
          created_at?: string
          id?: string
          price?: number
          quantity?: number
          side?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          receiver_country: string | null
          recipient: string | null
          sender_country: string | null
          status: Database["public"]["Enums"]["tx_status"] | null
          title: string
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          receiver_country?: string | null
          recipient?: string | null
          sender_country?: string | null
          status?: Database["public"]["Enums"]["tx_status"] | null
          title: string
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          receiver_country?: string | null
          recipient?: string | null
          sender_country?: string | null
          status?: Database["public"]["Enums"]["tx_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["tx_type"]
          user_id?: string
        }
        Relationships: []
      }
      tredbeings: {
        Row: {
          created_at: string
          entity_id: string
          goals: Json | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["tredbeing_kind"]
          name: string
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          goals?: Json | null
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["tredbeing_kind"]
          name: string
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          goals?: Json | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["tredbeing_kind"]
          name?: string
          permissions?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tredbeings_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: true
            referencedRelation: "konsmik_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_holdings: {
        Row: {
          avg_cost: number
          basket_id: string
          created_at: string
          id: string
          units: number
          user_id: string
        }
        Insert: {
          avg_cost?: number
          basket_id: string
          created_at?: string
          id?: string
          units?: number
          user_id: string
        }
        Update: {
          avg_cost?: number
          basket_id?: string
          created_at?: string
          id?: string
          units?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_holdings_basket_id_fkey"
            columns: ["basket_id"]
            isOneToOne: false
            referencedRelation: "investment_baskets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed: boolean | null
          id: string
          mission_id: string
          progress: number
          rewarded_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          mission_id: string
          progress?: number
          rewarded_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          mission_id?: string
          progress?: number
          rewarded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      virtual_cards: {
        Row: {
          card_number_last4: string
          created_at: string
          current_spend: number
          id: string
          nickname: string | null
          spend_limit: number | null
          status: string
          user_id: string
        }
        Insert: {
          card_number_last4: string
          created_at?: string
          current_spend?: number
          id?: string
          nickname?: string | null
          spend_limit?: number | null
          status?: string
          user_id: string
        }
        Update: {
          card_number_last4?: string
          created_at?: string
          current_spend?: number
          id?: string
          nickname?: string | null
          spend_limit?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_commands: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          intent: string | null
          result: Json | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          result?: Json | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          result?: Json | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waidespruf_proofs: {
        Row: {
          created_at: string
          id: string
          issued_to: string | null
          owner_id: string
          payload: Json
          proof_hash: string
          subject_id: string
          subject_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          issued_to?: string | null
          owner_id: string
          payload: Json
          proof_hash: string
          subject_id: string
          subject_type: string
        }
        Update: {
          created_at?: string
          id?: string
          issued_to?: string | null
          owner_id?: string
          payload?: Json
          proof_hash?: string
          subject_id?: string
          subject_type?: string
        }
        Relationships: []
      }
      wallet_ledger: {
        Row: {
          amount: number
          balance_after: number
          category: string
          created_at: string
          description: string | null
          direction: string
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          category: string
          created_at?: string
          description?: string | null
          direction: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          category?: string
          created_at?: string
          description?: string | null
          direction?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_ledger_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_lock_releases: {
        Row: {
          amount: number
          id: string
          lock_id: string
          released_at: string
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          lock_id: string
          released_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          lock_id?: string
          released_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_lock_releases_lock_id_fkey"
            columns: ["lock_id"]
            isOneToOne: false
            referencedRelation: "wallet_locks"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_locks: {
        Row: {
          created_at: string
          daily_release: number
          id: string
          last_release_date: string | null
          name: string
          released_amount: number
          start_date: string
          status: string
          total_amount: number
          user_id: string
          wallet_id: string
        }
        Insert: {
          created_at?: string
          daily_release: number
          id?: string
          last_release_date?: string | null
          name: string
          released_amount?: number
          start_date?: string
          status?: string
          total_amount: number
          user_id: string
          wallet_id: string
        }
        Update: {
          created_at?: string
          daily_release?: number
          id?: string
          last_release_date?: string | null
          name?: string
          released_amount?: number
          start_date?: string
          status?: string
          total_amount?: number
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_locks_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number | null
          created_at: string | null
          currency_type: string
          id: string
          last_updated: string | null
          locked_balance: number | null
          total_balance: number | null
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          created_at?: string | null
          currency_type?: string
          id?: string
          last_updated?: string | null
          locked_balance?: number | null
          total_balance?: number | null
          user_id: string
        }
        Update: {
          available_balance?: number | null
          created_at?: string | null
          currency_type?: string
          id?: string
          last_updated?: string | null
          locked_balance?: number | null
          total_balance?: number | null
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      yield_stakes: {
        Row: {
          accrued: number
          apy: number
          id: string
          principal: number
          started_at: string
          status: string
          unstaked_at: string | null
          user_id: string
        }
        Insert: {
          accrued?: number
          apy?: number
          id?: string
          principal: number
          started_at?: string
          status?: string
          unstaked_at?: string | null
          user_id: string
        }
        Update: {
          accrued?: number
          apy?: number
          id?: string
          principal?: number
          started_at?: string
          status?: string
          unstaked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buy_event_ticket: { Args: { _event_id: string }; Returns: string }
      claim_mission: {
        Args: { _mission_id: string; _proof?: Json }
        Returns: string
      }
      confirm_funding: {
        Args: { _approve: boolean; _notes?: string; _request_id: string }
        Returns: undefined
      }
      cooperative_contribute: {
        Args: { _amount: number; _coop_id: string }
        Returns: undefined
      }
      create_scheduled_action: {
        Args: {
          _action_type: string
          _amount?: number
          _message?: string
          _scheduled_for: string
          _target_contact?: string
          _target_user_id?: string
        }
        Returns: string
      }
      create_tredbeing: {
        Args: {
          _goals?: Json
          _kind: Database["public"]["Enums"]["tredbeing_kind"]
          _name: string
        }
        Returns: string
      }
      create_wallet_lock: {
        Args: { _daily: number; _name: string; _total: number }
        Returns: string
      }
      donate_to_cause: {
        Args: {
          _amount: number
          _anonymous?: boolean
          _cause_id: string
          _message?: string
        }
        Returns: string
      }
      ensure_wallet: { Args: { _user_id: string }; Returns: string }
      entity_treasury_move: {
        Args: {
          _amount: number
          _category: string
          _description?: string
          _direction: string
          _entity_id: string
          _ref_id?: string
          _ref_type?: string
        }
        Returns: string
      }
      execute_due_scheduled_actions: { Args: never; Returns: number }
      family_contribute: {
        Args: { _amount: number; _category?: string; _family_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_circle_member: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
      }
      is_coop_admin: {
        Args: { _coop_id: string; _user_id: string }
        Returns: boolean
      }
      is_coop_member: {
        Args: { _coop_id: string; _user_id: string }
        Returns: boolean
      }
      is_expense_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_head: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_thread_participant: {
        Args: { _thread_id: string; _user_id: string }
        Returns: boolean
      }
      issue_waidespruf_proof: {
        Args: {
          _issued_to?: string
          _payload: Json
          _subject_id: string
          _subject_type: string
        }
        Returns: string
      }
      onyix_allocate: {
        Args: {
          _amount: number
          _entity_id: string
          _reason?: string
          _reserve_id: string
        }
        Returns: string
      }
      onyix_burn: {
        Args: { _amount: number; _reason?: string; _reserve_id: string }
        Returns: string
      }
      onyix_consume: {
        Args: {
          _amount: number
          _entity_id: string
          _reason?: string
          _reserve_id: string
        }
        Returns: string
      }
      open_staking_position: {
        Args: { _amount: number; _plan_id: string }
        Returns: string
      }
      predict_stake: {
        Args: { _amount: number; _market_id: string; _side: string }
        Returns: string
      }
      process_drip_releases: { Args: never; Returns: number }
      process_staking_accrual: { Args: never; Returns: number }
      process_wallet_movement: {
        Args: {
          _amount: number
          _category: string
          _description?: string
          _direction: string
          _reference_id?: string
          _reference_type?: string
          _user_id: string
        }
        Returns: string
      }
      recompute_reputation: { Args: { _user_id: string }; Returns: undefined }
      resolve_provider: {
        Args: {
          _country: string
          _service: Database["public"]["Enums"]["provider_service_kind"]
        }
        Returns: {
          code: string
          priority: number
          provider_id: string
        }[]
      }
      send_money: {
        Args: { _amount: number; _description?: string; _recipient_id: string }
        Returns: string
      }
      snapshot_civilization_metrics: { Args: never; Returns: undefined }
      verify_mission_claim: {
        Args: { _approve: boolean; _claim_id: string }
        Returns: undefined
      }
    }
    Enums: {
      account_status: "active" | "frozen" | "suspended" | "closed"
      alert_severity: "low" | "medium" | "high" | "critical"
      app_role: "admin" | "moderator" | "user" | "super_admin" | "agent"
      coop_role: "admin" | "treasurer" | "member"
      cooperative_kind:
        | "village"
        | "association"
        | "school"
        | "church"
        | "community"
        | "cooperative"
      entity_kind:
        | "konsmik_core"
        | "tredbeing"
        | "smaibeing"
        | "family"
        | "cooperative"
        | "merchant"
        | "government"
        | "community"
      family_role: "head" | "parent" | "child" | "guardian" | "member"
      integration_status: "active" | "inactive" | "error" | "testing"
      kyc_status: "pending" | "verified" | "rejected" | "expired"
      provider_service_kind:
        | "deposit"
        | "payout"
        | "virtual_account"
        | "transfer"
        | "airtime"
        | "data"
        | "bill"
        | "electricity"
        | "cable"
        | "education"
        | "fx"
        | "card"
      provider_status: "active" | "inactive" | "testing" | "error" | "disabled"
      tredbeing_kind: "saving" | "investment" | "trading" | "merchant"
      tx_status: "completed" | "pending" | "failed" | "reversed" | "flagged"
      tx_type:
        | "transfer"
        | "airtime"
        | "data"
        | "bill"
        | "payment"
        | "received"
        | "qr-pay"
      webhook_status:
        | "received"
        | "processing"
        | "processed"
        | "failed"
        | "ignored"
        | "duplicate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "frozen", "suspended", "closed"],
      alert_severity: ["low", "medium", "high", "critical"],
      app_role: ["admin", "moderator", "user", "super_admin", "agent"],
      coop_role: ["admin", "treasurer", "member"],
      cooperative_kind: [
        "village",
        "association",
        "school",
        "church",
        "community",
        "cooperative",
      ],
      entity_kind: [
        "konsmik_core",
        "tredbeing",
        "smaibeing",
        "family",
        "cooperative",
        "merchant",
        "government",
        "community",
      ],
      family_role: ["head", "parent", "child", "guardian", "member"],
      integration_status: ["active", "inactive", "error", "testing"],
      kyc_status: ["pending", "verified", "rejected", "expired"],
      provider_service_kind: [
        "deposit",
        "payout",
        "virtual_account",
        "transfer",
        "airtime",
        "data",
        "bill",
        "electricity",
        "cable",
        "education",
        "fx",
        "card",
      ],
      provider_status: ["active", "inactive", "testing", "error", "disabled"],
      tredbeing_kind: ["saving", "investment", "trading", "merchant"],
      tx_status: ["completed", "pending", "failed", "reversed", "flagged"],
      tx_type: [
        "transfer",
        "airtime",
        "data",
        "bill",
        "payment",
        "received",
        "qr-pay",
      ],
      webhook_status: [
        "received",
        "processing",
        "processed",
        "failed",
        "ignored",
        "duplicate",
      ],
    },
  },
} as const
