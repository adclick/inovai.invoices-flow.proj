export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: {
          active: boolean
          client_id: string
          created_at: string
          duration: number
          estimated_cost: number | null
          id: string
          name: string
          revenue: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          client_id: string
          created_at?: string
          duration: number
          estimated_cost?: number | null
          id?: string
          name: string
          revenue?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          client_id?: string
          created_at?: string
          duration?: number
          estimated_cost?: number | null
          id?: string
          name?: string
          revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_fields: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      jobs: {
        Row: {
          campaign_id: string
          client_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          documents: string[] | null
          due_date: string | null
          id: string
          manager_id: string
          manager_ok: boolean
          months: Database["public"]["Enums"]["month_type"][]
          paid: boolean
          private_notes: string | null
          provider_id: string
          provider_notification_schedule_id: string | null
          public_notes: string | null
          public_token: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          value: number
        }
        Insert: {
          campaign_id: string
          client_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          documents?: string[] | null
          due_date?: string | null
          id?: string
          manager_id: string
          manager_ok?: boolean
          months: Database["public"]["Enums"]["month_type"][]
          paid?: boolean
          private_notes?: string | null
          provider_id: string
          provider_notification_schedule_id?: string | null
          public_notes?: string | null
          public_token?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          value: number
        }
        Update: {
          campaign_id?: string
          client_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          documents?: string[] | null
          due_date?: string | null
          id?: string
          manager_id?: string
          manager_ok?: boolean
          months?: Database["public"]["Enums"]["month_type"][]
          paid?: boolean
          private_notes?: string | null
          provider_id?: string
          provider_notification_schedule_id?: string | null
          public_notes?: string | null
          public_token?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_provider_notification_schedule_id_fkey"
            columns: ["provider_notification_schedule_id"]
            isOneToOne: false
            referencedRelation: "providers_notifications_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs_custom_fields: {
        Row: {
          created_at: string
          custom_field_id: string
          id: string
          job_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          custom_field_id: string
          id?: string
          job_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          custom_field_id?: string
          id?: string
          job_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_custom_fields_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_custom_fields_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          active: boolean
          country: string | null
          created_at: string
          email: string
          iban: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          country?: string | null
          created_at?: string
          email: string
          iban?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          country?: string | null
          created_at?: string
          email?: string
          iban?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      providers_notifications_schedules: {
        Row: {
          created_at: string
          days: number[]
          hour: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days: number[]
          hour: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: number[]
          hour?: number
          id?: string
          name?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_or_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_finance: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_invitation_token: {
        Args: { token_value: string }
        Returns: {
          is_valid: boolean
          invitation_id: string
          email: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "finance"
      currency_type: "euro" | "usd" | "gbp"
      job_status:
        | "New"
        | "Manager OK"
        | "Pending Invoice"
        | "Pending Payment"
        | "Paid"
      month_type:
        | "january"
        | "february"
        | "march"
        | "april"
        | "may"
        | "june"
        | "july"
        | "august"
        | "september"
        | "october"
        | "november"
        | "december"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "finance"],
      currency_type: ["euro", "usd", "gbp"],
      job_status: [
        "New",
        "Manager OK",
        "Pending Invoice",
        "Pending Payment",
        "Paid",
      ],
      month_type: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ],
    },
  },
} as const
