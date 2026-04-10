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
      audit_log: {
        Row: {
          action: string
          changed_by: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          category: Database["public"]["Enums"]["request_category"] | null
          classified_at: string | null
          classified_by: string | null
          created_at: string
          date_received: string
          description: string
          id: string
          impact: string
          is_deleted: boolean
          request_type: Database["public"]["Enums"]["request_category"] | null
          size_estimate: string | null
          source_customer: string
          sprint_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          submitter_id: string
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["request_urgency"]
          workaround: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["request_category"] | null
          classified_at?: string | null
          classified_by?: string | null
          created_at?: string
          date_received?: string
          description: string
          id?: string
          impact: string
          is_deleted?: boolean
          request_type?: Database["public"]["Enums"]["request_category"] | null
          size_estimate?: string | null
          source_customer: string
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitter_id: string
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["request_urgency"]
          workaround?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["request_category"] | null
          classified_at?: string | null
          classified_by?: string | null
          created_at?: string
          date_received?: string
          description?: string
          id?: string
          impact?: string
          is_deleted?: boolean
          request_type?: Database["public"]["Enums"]["request_category"] | null
          size_estimate?: string | null
          source_customer?: string
          sprint_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitter_id?: string
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["request_urgency"]
          workaround?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_interrupts: {
        Row: {
          category_confirmation: Database["public"]["Enums"]["request_category"]
          created_at: string
          created_by: string
          deprioritised_items: string
          id: string
          reason: string
          request_id: string
          sprint_id: string
        }
        Insert: {
          category_confirmation: Database["public"]["Enums"]["request_category"]
          created_at?: string
          created_by: string
          deprioritised_items: string
          id?: string
          reason: string
          request_id: string
          sprint_id: string
        }
        Update: {
          category_confirmation?: Database["public"]["Enums"]["request_category"]
          created_at?: string
          created_by?: string
          deprioritised_items?: string
          id?: string
          reason?: string
          request_id?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_interrupts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_interrupts_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          created_at: string
          created_by: string
          end_date: string
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["sprint_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["sprint_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["sprint_status"]
          updated_at?: string
        }
        Relationships: []
      }
      triage_sessions: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          scheduled_date: string
          status: Database["public"]["Enums"]["triage_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["triage_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["triage_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_pm_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "pm" | "submitter" | "viewer"
      request_category:
        | "production_bug"
        | "client_commitment"
        | "usability_issue"
        | "new_feature"
        | "tech_enabler"
      request_status:
        | "intake"
        | "classified"
        | "in_triage"
        | "sprint_candidate"
        | "in_sprint"
        | "done"
        | "deferred"
      request_urgency: "critical" | "high" | "medium" | "low"
      sprint_status: "planning" | "active" | "completed"
      triage_status: "scheduled" | "in_progress" | "completed"
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
      app_role: ["admin", "pm", "submitter", "viewer"],
      request_category: [
        "production_bug",
        "client_commitment",
        "usability_issue",
        "new_feature",
        "tech_enabler",
      ],
      request_status: [
        "intake",
        "classified",
        "in_triage",
        "sprint_candidate",
        "in_sprint",
        "done",
        "deferred",
      ],
      request_urgency: ["critical", "high", "medium", "low"],
      sprint_status: ["planning", "active", "completed"],
      triage_status: ["scheduled", "in_progress", "completed"],
    },
  },
} as const
