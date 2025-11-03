-- Sprint 6: Guild Wars and Territory Control
CREATE TABLE IF NOT EXISTS guild_wars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_1_id uuid REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  guild_2_id uuid REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  guild_1_points integer DEFAULT 0,
  guild_2_points integer DEFAULT 0,
  winner_id uuid REFERENCES guilds(id) ON DELETE SET NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guild_war_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id uuid REFERENCES guild_wars(id) ON DELETE CASCADE NOT NULL,
  attacker_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  defender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  winner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  combat_log jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS territory_control (
  territory_id text PRIMARY KEY,
  guild_id uuid REFERENCES guilds(id) ON DELETE SET NULL,
  captured_at timestamptz DEFAULT now(),
  defense_wins integer DEFAULT 0,
  challenge_cooldown timestamptz
);

-- Insert default territory
INSERT INTO territory_control (territory_id, guild_id, captured_at) 
VALUES ('stone_coliseum', NULL, now())
ON CONFLICT (territory_id) DO NOTHING;

-- Sprint 7: Story Quest System
CREATE TABLE IF NOT EXISTS story_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_chain text NOT NULL,
  current_step integer DEFAULT 1,
  completed boolean DEFAULT false,
  rewards_claimed jsonb DEFAULT '[]'::jsonb,
  progress jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add guild buffs tracking to guilds table
ALTER TABLE guilds 
ADD COLUMN IF NOT EXISTS active_buffs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hall_level integer DEFAULT 1;

-- Add PvP/Boss stats to profiles for evolution requirements
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pvp_wins integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pvp_losses integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS boss_defeats integer DEFAULT 0;

-- Enable RLS
ALTER TABLE guild_wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_war_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_quests ENABLE ROW LEVEL SECURITY;

-- Guild Wars Policies
CREATE POLICY "Anyone can view guild wars"
  ON guild_wars FOR SELECT
  USING (true);

CREATE POLICY "Guild leaders can create wars"
  ON guild_wars FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM guilds 
      WHERE (id = guild_1_id OR id = guild_2_id) 
      AND leader_id = auth.uid()
    )
  );

CREATE POLICY "Guild leaders can update their wars"
  ON guild_wars FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM guilds 
      WHERE (id = guild_1_id OR id = guild_2_id) 
      AND leader_id = auth.uid()
    )
  );

-- Guild War Matches Policies
CREATE POLICY "Guild members can view war matches"
  ON guild_war_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM guild_wars gw
      JOIN guild_members gm ON (gm.guild_id = gw.guild_1_id OR gm.guild_id = gw.guild_2_id)
      WHERE gw.id = war_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Guild members can create war matches"
  ON guild_war_matches FOR INSERT
  WITH CHECK (
    auth.uid() = attacker_id AND
    EXISTS (
      SELECT 1 FROM guild_wars gw
      JOIN guild_members gm ON (gm.guild_id = gw.guild_1_id OR gm.guild_id = gw.guild_2_id)
      WHERE gw.id = war_id AND gm.user_id = auth.uid() AND gw.status = 'active'
    )
  );

-- Territory Control Policies
CREATE POLICY "Anyone can view territory control"
  ON territory_control FOR SELECT
  USING (true);

CREATE POLICY "Guild leaders can challenge for territory"
  ON territory_control FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM guilds 
      WHERE leader_id = auth.uid()
    )
  );

-- Story Quests Policies
CREATE POLICY "Users can view own story quests"
  ON story_quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own story quests"
  ON story_quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own story quests"
  ON story_quests FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guild_wars_guilds ON guild_wars(guild_1_id, guild_2_id);
CREATE INDEX IF NOT EXISTS idx_guild_war_matches_war ON guild_war_matches(war_id);
CREATE INDEX IF NOT EXISTS idx_story_quests_user ON story_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_pvp_stats ON profiles(pvp_wins, boss_defeats);