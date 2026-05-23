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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_triage_assessments: {
        Row: {
          assessment_kind: Database["public"]["Enums"]["assessment_kind"]
          based_on_interaction_id: string | null
          clinician_decision:
            | Database["public"]["Enums"]["clinician_decision"]
            | null
          clinician_id: string | null
          created_at: string
          id: string
          iteration_number: number
          model_version: string
          n8n_execution_id: string
          raw_output: Json
          reviewed_at: string | null
          sanitized_input: Json
          suggested_priority: number | null
          triage_case_id: string
        }
        Insert: {
          assessment_kind: Database["public"]["Enums"]["assessment_kind"]
          based_on_interaction_id?: string | null
          clinician_decision?:
            | Database["public"]["Enums"]["clinician_decision"]
            | null
          clinician_id?: string | null
          created_at?: string
          id?: string
          iteration_number: number
          model_version: string
          n8n_execution_id: string
          raw_output: Json
          reviewed_at?: string | null
          sanitized_input: Json
          suggested_priority?: number | null
          triage_case_id: string
        }
        Update: {
          assessment_kind?: Database["public"]["Enums"]["assessment_kind"]
          based_on_interaction_id?: string | null
          clinician_decision?:
            | Database["public"]["Enums"]["clinician_decision"]
            | null
          clinician_id?: string | null
          created_at?: string
          id?: string
          iteration_number?: number
          model_version?: string
          n8n_execution_id?: string
          raw_output?: Json
          reviewed_at?: string | null
          sanitized_input?: Json
          suggested_priority?: number | null
          triage_case_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_triage_assessments_based_on_interaction_id_fkey"
            columns: ["based_on_interaction_id"]
            isOneToOne: false
            referencedRelation: "triage_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_triage_assessments_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "medics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_triage_assessments_triage_case_id_fkey"
            columns: ["triage_case_id"]
            isOneToOne: false
            referencedRelation: "triage_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          id: string
          medic_id: string
          patient_id: string
          reason: string
          room: string | null
          scheduled_at: string
          site_id: string
          source_channel: Database["public"]["Enums"]["channel"]
          status: Database["public"]["Enums"]["appointment_status"]
          triage_case_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          medic_id: string
          patient_id: string
          reason: string
          room?: string | null
          scheduled_at: string
          site_id: string
          source_channel: Database["public"]["Enums"]["channel"]
          status?: Database["public"]["Enums"]["appointment_status"]
          triage_case_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          medic_id?: string
          patient_id?: string
          reason?: string
          room?: string | null
          scheduled_at?: string
          site_id?: string
          source_channel?: Database["public"]["Enums"]["channel"]
          status?: Database["public"]["Enums"]["appointment_status"]
          triage_case_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_medic_id_fkey"
            columns: ["medic_id"]
            isOneToOne: false
            referencedRelation: "medics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_triage_case_id_fkey"
            columns: ["triage_case_id"]
            isOneToOne: false
            referencedRelation: "triage_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["user_role"] | null
          changed_fields: Json
          context: Json
          id: number
          occurred_at: string
          row_id: string
          salt: string
          table_name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          changed_fields?: Json
          context?: Json
          id?: number
          occurred_at?: string
          row_id: string
          salt: string
          table_name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          changed_fields?: Json
          context?: Json
          id?: number
          occurred_at?: string
          row_id?: string
          salt?: string
          table_name?: string
        }
        Relationships: []
      }
      medics: {
        Row: {
          created_at: string
          document: string
          document_type: Database["public"]["Enums"]["document_type"]
          full_name: string
          id: string
          license_number: string
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document: string
          document_type: Database["public"]["Enums"]["document_type"]
          full_name: string
          id: string
          license_number: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          full_name?: string
          id?: string
          license_number?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          created_at: string
          date_of_birth: string
          document: string
          document_type: Database["public"]["Enums"]["document_type"]
          full_name: string
          id: string
          phone: string | null
          risk: Database["public"]["Enums"]["risk_level"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          document: string
          document_type: Database["public"]["Enums"]["document_type"]
          full_name: string
          id: string
          phone?: string | null
          risk?: Database["public"]["Enums"]["risk_level"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          document?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          full_name?: string
          id?: string
          phone?: string | null
          risk?: Database["public"]["Enums"]["risk_level"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          address: string
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      triage_cases: {
        Row: {
          assigned_medic_id: string | null
          created_at: string
          duration_text: string | null
          id: string
          patient_id: string
          priority: number | null
          relevant_history: string | null
          source_channel: Database["public"]["Enums"]["channel"]
          status: Database["public"]["Enums"]["triage_status"]
          submitted_at: string
          summary: string
          symptoms: string[]
          updated_at: string
        }
        Insert: {
          assigned_medic_id?: string | null
          created_at?: string
          duration_text?: string | null
          id?: string
          patient_id: string
          priority?: number | null
          relevant_history?: string | null
          source_channel: Database["public"]["Enums"]["channel"]
          status?: Database["public"]["Enums"]["triage_status"]
          submitted_at?: string
          summary: string
          symptoms?: string[]
          updated_at?: string
        }
        Update: {
          assigned_medic_id?: string | null
          created_at?: string
          duration_text?: string | null
          id?: string
          patient_id?: string
          priority?: number | null
          relevant_history?: string | null
          source_channel?: Database["public"]["Enums"]["channel"]
          status?: Database["public"]["Enums"]["triage_status"]
          submitted_at?: string
          summary?: string
          symptoms?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "triage_cases_assigned_medic_id_fkey"
            columns: ["assigned_medic_id"]
            isOneToOne: false
            referencedRelation: "medics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "triage_cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      triage_interactions: {
        Row: {
          actor: Database["public"]["Enums"]["interaction_actor"]
          content: string
          created_at: string
          id: string
          triage_case_id: string
          turn_number: number
        }
        Insert: {
          actor: Database["public"]["Enums"]["interaction_actor"]
          content: string
          created_at?: string
          id?: string
          triage_case_id: string
          turn_number: number
        }
        Update: {
          actor?: Database["public"]["Enums"]["interaction_actor"]
          content?: string
          created_at?: string
          id?: string
          triage_case_id?: string
          turn_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "triage_interactions_triage_case_id_fkey"
            columns: ["triage_case_id"]
            isOneToOne: false
            referencedRelation: "triage_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          error_message: string | null
          kind: Database["public"]["Enums"]["whatsapp_kind"]
          linked_patient_id: string | null
          linked_triage_case_id: string | null
          phone_e164: string
          processed_at: string | null
          provider_message_id: string
          received_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["whatsapp_status"]
        }
        Insert: {
          body?: string | null
          direction: Database["public"]["Enums"]["message_direction"]
          error_message?: string | null
          kind: Database["public"]["Enums"]["whatsapp_kind"]
          linked_patient_id?: string | null
          linked_triage_case_id?: string | null
          phone_e164: string
          processed_at?: string | null
          provider_message_id: string
          received_at?: string | null
          sent_at?: string | null
          status: Database["public"]["Enums"]["whatsapp_status"]
        }
        Update: {
          body?: string | null
          direction?: Database["public"]["Enums"]["message_direction"]
          error_message?: string | null
          kind?: Database["public"]["Enums"]["whatsapp_kind"]
          linked_patient_id?: string | null
          linked_triage_case_id?: string | null
          phone_e164?: string
          processed_at?: string | null
          provider_message_id?: string
          received_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_status"]
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_linked_patient_id_fkey"
            columns: ["linked_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_linked_triage_case_id_fkey"
            columns: ["linked_triage_case_id"]
            isOneToOne: false
            referencedRelation: "triage_cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hash_changed_fields: {
        Args: { new_row: Json; old_row: Json; salt: string }
        Returns: Json
      }
      hash_with_salt: { Args: { salt: string; val: string }; Returns: string }
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "cancelled" | "completed"
      assessment_kind: "initial" | "follow_up" | "final"
      audit_action: "INSERT" | "UPDATE" | "DELETE" | "SELECT_BULK"
      channel: "web" | "whatsapp"
      clinician_decision: "accepted" | "overridden" | "rejected"
      document_type: "CC" | "CE" | "TI" | "PA" | "RC"
      interaction_actor: "patient" | "ai" | "clinician"
      message_direction: "inbound" | "outbound"
      risk_level: "ALTA" | "MEDIA" | "BAJA"
      triage_status:
        | "submitted"
        | "pending_medic_assessment"
        | "approved"
        | "escalated"
        | "completed"
      user_role: "patient" | "medic" | "admin"
      whatsapp_kind:
        | "triage_prompt"
        | "scheduling_confirmation"
        | "freeform_inbound"
        | "system"
      whatsapp_status:
        | "received"
        | "processing"
        | "processed"
        | "sent"
        | "failed"
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
      appointment_status: ["pending", "confirmed", "cancelled", "completed"],
      assessment_kind: ["initial", "follow_up", "final"],
      audit_action: ["INSERT", "UPDATE", "DELETE", "SELECT_BULK"],
      channel: ["web", "whatsapp"],
      clinician_decision: ["accepted", "overridden", "rejected"],
      document_type: ["CC", "CE", "TI", "PA", "RC"],
      interaction_actor: ["patient", "ai", "clinician"],
      message_direction: ["inbound", "outbound"],
      risk_level: ["ALTA", "MEDIA", "BAJA"],
      triage_status: [
        "submitted",
        "pending_medic_assessment",
        "approved",
        "escalated",
        "completed",
      ],
      user_role: ["patient", "medic", "admin"],
      whatsapp_kind: [
        "triage_prompt",
        "scheduling_confirmation",
        "freeform_inbound",
        "system",
      ],
      whatsapp_status: [
        "received",
        "processing",
        "processed",
        "sent",
        "failed",
      ],
    },
  },
} as const
