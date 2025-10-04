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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cosmetic_inventory: {
        Row: {
          cosmetic_name: string
          cosmetic_type: string
          created_at: string
          equipped: boolean
          id: string
          rarity: Database["public"]["Enums"]["rarity_tier"]
          user_id: string
        }
        Insert: {
          cosmetic_name: string
          cosmetic_type: string
          created_at?: string
          equipped?: boolean
          id?: string
          rarity: Database["public"]["Enums"]["rarity_tier"]
          user_id: string
        }
        Update: {
          cosmetic_name?: string
          cosmetic_type?: string
          created_at?: string
          equipped?: boolean
          id?: string
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          user_id?: string
        }
        Relationships: []
      }
      functional_inventory: {
        Row: {
          created_at: string | null
          damage_bonus: number
          equipped: boolean
          id: string
          item_name: string
          item_type: string
          materials: number
          rarity: Database["public"]["Enums"]["rarity_tier"]
          slot: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          damage_bonus?: number
          equipped?: boolean
          id?: string
          item_name: string
          item_type: string
          materials?: number
          rarity: Database["public"]["Enums"]["rarity_tier"]
          slot?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          damage_bonus?: number
          equipped?: boolean
          id?: string
          item_name?: string
          item_type?: string
          materials?: number
          rarity?: Database["public"]["Enums"]["rarity_tier"]
          slot?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lootbox_history: {
        Row: {
          box_type: string
          id: string
          items_received: Json
          opened_at: string
          user_id: string
        }
        Insert: {
          box_type: string
          id?: string
          items_received: Json
          opened_at?: string
          user_id: string
        }
        Update: {
          box_type?: string
          id?: string
          items_received?: Json
          opened_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_progress: {
        Row: {
          attack_damage: number
          crafting_materials: number
          created_at: string
          currency: number
          current_level: number
          current_stage: number
          damage_per_click: number
          id: string
          left_hand_weapon: string | null
          premium_currency: number
          prestige_level: number
          prestige_multiplier: number
          right_hand_weapon: string | null
          total_damage: number
          updated_at: string
          upgrades: Json | null
          user_id: string
        }
        Insert: {
          attack_damage?: number
          crafting_materials?: number
          created_at?: string
          currency?: number
          current_level?: number
          current_stage?: number
          damage_per_click?: number
          id?: string
          left_hand_weapon?: string | null
          premium_currency?: number
          prestige_level?: number
          prestige_multiplier?: number
          right_hand_weapon?: string | null
          total_damage?: number
          updated_at?: string
          upgrades?: Json | null
          user_id: string
        }
        Update: {
          attack_damage?: number
          crafting_materials?: number
          created_at?: string
          currency?: number
          current_level?: number
          current_stage?: number
          damage_per_click?: number
          id?: string
          left_hand_weapon?: string | null
          premium_currency?: number
          prestige_level?: number
          prestige_multiplier?: number
          right_hand_weapon?: string | null
          total_damage?: number
          updated_at?: string
          upgrades?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      raid_bosses: {
        Row: {
          boss_name: string
          created_at: string
          current_health: number
          defeated_at: string | null
          expires_at: string
          id: string
          is_active: boolean
          max_health: number
          stage_level: number
        }
        Insert: {
          boss_name: string
          created_at?: string
          current_health: number
          defeated_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean
          max_health: number
          stage_level: number
        }
        Update: {
          boss_name?: string
          created_at?: string
          current_health?: number
          defeated_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          max_health?: number
          stage_level?: number
        }
        Relationships: []
      }
      raid_contributions: {
        Row: {
          created_at: string
          damage_dealt: number
          id: string
          raid_boss_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          damage_dealt?: number
          id?: string
          raid_boss_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          damage_dealt?: number
          id?: string
          raid_boss_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raid_contributions_raid_boss_id_fkey"
            columns: ["raid_boss_id"]
            isOneToOne: false
            referencedRelation: "raid_bosses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          current_level: number | null
          current_stage: number | null
          damage_per_click: number | null
          prestige_level: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      rarity_tier:
        | "gray"
        | "light_blue"
        | "blue"
        | "green"
        | "yellow"
        | "orange"
        | "red"
        | "pink"
        | "violet"
        | "black"
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
      rarity_tier: [
        "gray",
        "light_blue",
        "blue",
        "green",
        "yellow",
        "orange",
        "red",
        "pink",
        "violet",
        "black",
      ],
    },
  },
} as const
