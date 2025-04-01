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
      jobs: {
        Row: {
          campaign_id: string
          client_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_type"]
          due_date: string | null
          id: string
          invoices: string[] | null
          manager_id: string
          manager_ok: boolean
          months: Database["public"]["Enums"]["month_type"][]
          paid: boolean
          private_notes: string | null
          provider_id: string
          provider_notification_schedule_id: string | null
          public_notes: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          value: number
        }
        Insert: {
          campaign_id: string
          client_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          due_date?: string | null
          id?: string
          invoices?: string[] | null
          manager_id: string
          manager_ok?: boolean
          months: Database["public"]["Enums"]["month_type"][]
          paid?: boolean
          private_notes?: string | null
          provider_id: string
          provider_notification_schedule_id?: string | null
          public_notes?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          value: number
        }
        Update: {
          campaign_id?: string
          client_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_type"]
          due_date?: string | null
          id?: string
          invoices?: string[] | null
          manager_id?: string
          manager_ok?: boolean
          months?: Database["public"]["Enums"]["month_type"][]
          paid?: boolean
          private_notes?: string | null
          provider_id?: string
          provider_notification_schedule_id?: string | null
          public_notes?: string | null
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
    }
    Enums: {
      app_role: "super_admin" | "admin" | "finance"
      currency_type: "euro" | "usd" | "gbp"
      job_status: "inactive" | "active" | "closed"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
