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
      expense_categories: {
        Row: {
          color: string
          created_at: string
          financial_plan_id: string
          id: string
          name: string
          planned_amount: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          color?: string
          created_at?: string
          financial_plan_id: string
          id?: string
          name: string
          planned_amount?: number
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          color?: string
          created_at?: string
          financial_plan_id?: string
          id?: string
          name?: string
          planned_amount?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          expected_return_rate: number | null
          id: string
          monthly_contribution: number
          target_amount: number
          title: string
          type: Database["public"]["Enums"]["financial_goal_type"]
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          expected_return_rate?: number | null
          id?: string
          monthly_contribution?: number
          target_amount?: number
          title: string
          type?: Database["public"]["Enums"]["financial_goal_type"]
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          expected_return_rate?: number | null
          id?: string
          monthly_contribution?: number
          target_amount?: number
          title?: string
          type?: Database["public"]["Enums"]["financial_goal_type"]
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      financial_plans: {
        Row: {
          actual_income: number
          created_at: string
          id: string
          month: number
          planned_income: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          actual_income?: number
          created_at?: string
          id?: string
          month: number
          planned_income?: number
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          actual_income?: number
          created_at?: string
          id?: string
          month?: number
          planned_income?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          type: Database["public"]["Enums"]["contribution_type"]
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          contribution_date?: string
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["contribution_type"]
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["contribution_type"]
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          achievable: string
          created_at: string
          description: string
          id: string
          life_area_id: string | null
          measurable: string
          progress: number
          relevant: string
          specific: string
          status: Database["public"]["Enums"]["goal_status"]
          time_bound: string | null
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          achievable?: string
          created_at?: string
          description?: string
          id?: string
          life_area_id?: string | null
          measurable?: string
          progress?: number
          relevant?: string
          specific?: string
          status?: Database["public"]["Enums"]["goal_status"]
          time_bound?: string | null
          title: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          achievable?: string
          created_at?: string
          description?: string
          id?: string
          life_area_id?: string | null
          measurable?: string
          progress?: number
          relevant?: string
          specific?: string
          status?: Database["public"]["Enums"]["goal_status"]
          time_bound?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "goals_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_entries: {
        Row: {
          completed: boolean
          created_at: string
          entry_date: string
          id: string
          notes: string | null
          routine_item_id: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          entry_date: string
          id?: string
          notes?: string | null
          routine_item_id: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          entry_date?: string
          id?: string
          notes?: string | null
          routine_item_id?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "habit_entries_routine_item_id_fkey"
            columns: ["routine_item_id"]
            isOneToOne: false
            referencedRelation: "routine_items"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          linked_goal_ids: string[]
          mood: number | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          linked_goal_ids?: string[]
          mood?: number | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          linked_goal_ids?: string[]
          mood?: number | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      life_areas: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          goal_id: string
          id: string
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          goal_id: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          goal_id?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_snapshots: {
        Row: {
          created_at: string
          finances_budget_adherence: number
          finances_savings_rate: number
          finances_total_spent: number
          goals_active_count: number
          goals_average_progress: number
          goals_completed_count: number
          habits_consistency_rate: number
          habits_total_completed: number
          id: string
          life_areas_breakdown: Json
          month: number
          mvd_completed_days: number
          mvd_completion_rate: number
          mvd_longest_streak: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          finances_budget_adherence?: number
          finances_savings_rate?: number
          finances_total_spent?: number
          goals_active_count?: number
          goals_average_progress?: number
          goals_completed_count?: number
          habits_consistency_rate?: number
          habits_total_completed?: number
          id?: string
          life_areas_breakdown?: Json
          month: number
          mvd_completed_days?: number
          mvd_completion_rate?: number
          mvd_longest_streak?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          finances_budget_adherence?: number
          finances_savings_rate?: number
          finances_total_spent?: number
          goals_active_count?: number
          goals_average_progress?: number
          goals_completed_count?: number
          habits_consistency_rate?: number
          habits_total_completed?: number
          id?: string
          life_areas_breakdown?: Json
          month?: number
          mvd_completed_days?: number
          mvd_completion_rate?: number
          mvd_longest_streak?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      mvd_check_ins: {
        Row: {
          check_in_date: string
          completed_item_ids: string[]
          created_at: string
          energy_level: number | null
          id: string
          mood: number | null
          mvd_completed: boolean
          notes: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          check_in_date: string
          completed_item_ids?: string[]
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          mvd_completed?: boolean
          notes?: string | null
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          check_in_date?: string
          completed_item_ids?: string[]
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          mvd_completed?: boolean
          notes?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      mvd_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          description: string | null
          frequency: Database["public"]["Enums"]["reminder_frequency"]
          id: string
          is_active: boolean
          linked_entity_id: string | null
          notification_sent: boolean
          scheduled_date: string
          title: string
          type: Database["public"]["Enums"]["reminder_type"]
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          frequency?: Database["public"]["Enums"]["reminder_frequency"]
          id?: string
          is_active?: boolean
          linked_entity_id?: string | null
          notification_sent?: boolean
          scheduled_date?: string
          title: string
          type?: Database["public"]["Enums"]["reminder_type"]
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          frequency?: Database["public"]["Enums"]["reminder_frequency"]
          id?: string
          is_active?: boolean
          linked_entity_id?: string | null
          notification_sent?: boolean
          scheduled_date?: string
          title?: string
          type?: Database["public"]["Enums"]["reminder_type"]
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      routine_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          linked_goal_id: string | null
          sort_order: number
          time_of_day: Database["public"]["Enums"]["time_of_day"]
          title: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          linked_goal_id?: string | null
          sort_order?: number
          time_of_day?: Database["public"]["Enums"]["time_of_day"]
          title: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          linked_goal_id?: string | null
          sort_order?: number
          time_of_day?: Database["public"]["Enums"]["time_of_day"]
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "routine_items_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          description: string
          financial_plan_id: string | null
          id: string
          is_recurring: boolean
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          description?: string
          financial_plan_id?: string | null
          id?: string
          is_recurring?: boolean
          transaction_date?: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string
          financial_plan_id?: string | null
          id?: string
          is_recurring?: boolean
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_financial_plan_id_fkey"
            columns: ["financial_plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
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
      weekly_reviews: {
        Row: {
          created_at: string
          goals_reviewed: string[]
          id: string
          improvements: string
          overall_rating: number
          progress_reflection: string
          updated_at: string
          user_id: string
          week_end_date: string
          week_number: number
          week_start_date: string
          what_didnt_work: string
          what_worked: string
          year: number
        }
        Insert: {
          created_at?: string
          goals_reviewed?: string[]
          id?: string
          improvements?: string
          overall_rating?: number
          progress_reflection?: string
          updated_at?: string
          user_id: string
          week_end_date: string
          week_number: number
          week_start_date: string
          what_didnt_work?: string
          what_worked?: string
          year?: number
        }
        Update: {
          created_at?: string
          goals_reviewed?: string[]
          id?: string
          improvements?: string
          overall_rating?: number
          progress_reflection?: string
          updated_at?: string
          user_id?: string
          week_end_date?: string
          week_number?: number
          week_start_date?: string
          what_didnt_work?: string
          what_worked?: string
          year?: number
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
    }
    Enums: {
      app_role: "admin" | "user"
      contribution_type: "manual" | "scheduled" | "investment_return"
      financial_goal_type: "savings" | "investment" | "debt_payoff" | "purchase"
      goal_status: "planned" | "active" | "completed" | "paused"
      reminder_frequency: "once" | "daily" | "weekly" | "monthly"
      reminder_type: "goal" | "routine" | "review" | "custom"
      subscription_status: "trial" | "active" | "expired"
      time_of_day: "morning" | "afternoon" | "evening" | "anytime"
      transaction_type: "income" | "expense"
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
      app_role: ["admin", "user"],
      contribution_type: ["manual", "scheduled", "investment_return"],
      financial_goal_type: ["savings", "investment", "debt_payoff", "purchase"],
      goal_status: ["planned", "active", "completed", "paused"],
      reminder_frequency: ["once", "daily", "weekly", "monthly"],
      reminder_type: ["goal", "routine", "review", "custom"],
      subscription_status: ["trial", "active", "expired"],
      time_of_day: ["morning", "afternoon", "evening", "anytime"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
