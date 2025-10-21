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
      boss_fights: {
        Row: {
          boss_id: string
          combat_log: Json
          created_at: string
          damage_dealt: number
          id: string
          rewards: Json
          time_taken: number
          user_id: string
          victory: boolean
        }
        Insert: {
          boss_id: string
          combat_log?: Json
          created_at?: string
          damage_dealt?: number
          id?: string
          rewards?: Json
          time_taken: number
          user_id: string
          victory: boolean
        }
        Update: {
          boss_id?: string
          combat_log?: Json
          created_at?: string
          damage_dealt?: number
          id?: string
          rewards?: Json
          time_taken?: number
          user_id?: string
          victory?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "boss_fights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boss_fights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      boss_leaderboard: {
        Row: {
          best_time: number
          boss_id: string
          highest_damage: number
          id: string
          updated_at: string
          user_id: string
          username: string
          victories: number
        }
        Insert: {
          best_time: number
          boss_id: string
          highest_damage?: number
          id?: string
          updated_at?: string
          user_id: string
          username: string
          victories?: number
        }
        Update: {
          best_time?: number
          boss_id?: string
          highest_damage?: number
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
          victories?: number
        }
        Relationships: [
          {
            foreignKeyName: "boss_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boss_leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      cosmetic_items: {
        Row: {
          equipped: boolean
          id: string
          item_id: string
          item_type: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          equipped?: boolean
          id?: string
          item_id: string
          item_type: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          equipped?: boolean
          id?: string
          item_id?: string
          item_type?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cosmetic_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cosmetic_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          contribution: number
          guild_id: string
          id: string
          joined_at: string
          rank: string
          user_id: string
        }
        Insert: {
          contribution?: number
          guild_id: string
          id?: string
          joined_at?: string
          rank?: string
          user_id: string
        }
        Update: {
          contribution?: number
          guild_id?: string
          id?: string
          joined_at?: string
          rank?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          message: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          message: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          message?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          banner_color: string
          created_at: string
          description: string | null
          experience: number
          id: string
          leader_id: string
          level: number
          member_limit: number
          name: string
          updated_at: string
        }
        Insert: {
          banner_color?: string
          created_at?: string
          description?: string | null
          experience?: number
          id?: string
          leader_id: string
          level?: number
          member_limit?: number
          name: string
          updated_at?: string
        }
        Update: {
          banner_color?: string
          created_at?: string
          description?: string | null
          experience?: number
          id?: string
          leader_id?: string
          level?: number
          member_limit?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guilds_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guilds_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      hall_of_fame: {
        Row: {
          achievement_data: Json
          category: string
          id: string
          recorded_at: string
          user_id: string
          username: string
        }
        Insert: {
          achievement_data?: Json
          category: string
          id?: string
          recorded_at?: string
          user_id: string
          username: string
        }
        Update: {
          achievement_data?: Json
          category?: string
          id?: string
          recorded_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "hall_of_fame_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hall_of_fame_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          id: string
          level: number
          losses: number
          rank: number | null
          rating: number
          score: number
          updated_at: string
          user_id: string
          username: string
          wins: number
        }
        Insert: {
          id?: string
          level?: number
          losses?: number
          rank?: number | null
          rating?: number
          score?: number
          updated_at?: string
          user_id: string
          username: string
          wins?: number
        }
        Update: {
          id?: string
          level?: number
          losses?: number
          rank?: number | null
          rating?: number
          score?: number
          updated_at?: string
          user_id?: string
          username?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      prestige_records: {
        Row: {
          bonuses: Json
          id: string
          last_prestige_at: string | null
          prestige_level: number
          total_prestiges: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonuses?: Json
          id?: string
          last_prestige_at?: string | null
          prestige_level?: number
          total_prestiges?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonuses?: Json
          id?: string
          last_prestige_at?: string | null
          prestige_level?: number
          total_prestiges?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestige_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestige_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          character_data: Json
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          character_data: Json
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          character_data?: Json
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      pvp_matches: {
        Row: {
          attacker_id: string
          attacker_snapshot: Json
          combat_log: Json
          created_at: string
          defender_id: string
          defender_snapshot: Json
          id: string
          rating_change: number
          winner_id: string
        }
        Insert: {
          attacker_id: string
          attacker_snapshot: Json
          combat_log: Json
          created_at?: string
          defender_id: string
          defender_snapshot: Json
          id?: string
          rating_change: number
          winner_id: string
        }
        Update: {
          attacker_id?: string
          attacker_snapshot?: Json
          combat_log?: Json
          created_at?: string
          defender_id?: string
          defender_snapshot?: Json
          id?: string
          rating_change?: number
          winner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pvp_matches_attacker_id_fkey"
            columns: ["attacker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_attacker_id_fkey"
            columns: ["attacker_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_defender_id_fkey"
            columns: ["defender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_defender_id_fkey"
            columns: ["defender_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pvp_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "public_player_preview"
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
      public_player_preview: {
        Row: {
          class: string | null
          id: string | null
          level: number | null
          username: string | null
        }
        Insert: {
          class?: never
          id?: string | null
          level?: never
          username?: string | null
        }
        Update: {
          class?: never
          id?: string | null
          level?: never
          username?: string | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
