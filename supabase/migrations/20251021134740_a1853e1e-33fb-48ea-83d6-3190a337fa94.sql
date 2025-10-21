-- =============================================
-- PHASE 4: CONTENT EXPANSION DATABASE SCHEMA
-- =============================================

-- Boss Battles System
CREATE TABLE boss_fights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boss_id text NOT NULL,
  victory boolean NOT NULL,
  damage_dealt integer NOT NULL DEFAULT 0,
  time_taken integer NOT NULL, -- in seconds
  rewards jsonb NOT NULL DEFAULT '{}',
  combat_log jsonb NOT NULL DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE boss_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  boss_id text NOT NULL,
  best_time integer NOT NULL,
  highest_damage integer NOT NULL DEFAULT 0,
  victories integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, boss_id)
);

-- Guild System
CREATE TABLE guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  leader_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1,
  experience integer NOT NULL DEFAULT 0,
  member_limit integer NOT NULL DEFAULT 20,
  banner_color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE guild_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rank text NOT NULL DEFAULT 'member', -- member, officer, leader
  contribution integer NOT NULL DEFAULT 0,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE guild_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Prestige System
CREATE TABLE prestige_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prestige_level integer NOT NULL DEFAULT 0,
  total_prestiges integer NOT NULL DEFAULT 0,
  bonuses jsonb NOT NULL DEFAULT '{}',
  last_prestige_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Cosmetics System
CREATE TABLE cosmetic_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_type text NOT NULL, -- skin, title, effect, avatar_frame
  equipped boolean NOT NULL DEFAULT false,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Hall of Fame
CREATE TABLE hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  category text NOT NULL, -- legendary_warrior, guild_master, boss_slayer, prestige_champion
  achievement_data jsonb NOT NULL DEFAULT '{}',
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Indexes for performance
CREATE INDEX idx_boss_fights_user ON boss_fights(user_id);
CREATE INDEX idx_boss_fights_boss ON boss_fights(boss_id);
CREATE INDEX idx_boss_leaderboard_boss ON boss_leaderboard(boss_id, best_time);
CREATE INDEX idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX idx_guild_members_user ON guild_members(user_id);
CREATE INDEX idx_guild_messages_guild ON guild_messages(guild_id, created_at DESC);
CREATE INDEX idx_cosmetic_items_user ON cosmetic_items(user_id);
CREATE INDEX idx_hall_of_fame_category ON hall_of_fame(category);

-- RLS Policies for Boss Fights
ALTER TABLE boss_fights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boss fights" ON boss_fights
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boss fights" ON boss_fights
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Boss Leaderboard
ALTER TABLE boss_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view boss leaderboard" ON boss_leaderboard
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own boss records" ON boss_leaderboard
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boss records" ON boss_leaderboard
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Guilds
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view guilds" ON guilds
FOR SELECT USING (true);

CREATE POLICY "Users can create guilds" ON guilds
FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Guild leaders can update their guild" ON guilds
FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Guild leaders can delete their guild" ON guilds
FOR DELETE USING (auth.uid() = leader_id);

-- RLS Policies for Guild Members
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view guild members" ON guild_members
FOR SELECT USING (true);

CREATE POLICY "Users can join guilds" ON guild_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave guilds" ON guild_members
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Guild leaders and officers can update members" ON guild_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM guild_members gm
    WHERE gm.guild_id = guild_members.guild_id
    AND gm.user_id = auth.uid()
    AND gm.rank IN ('leader', 'officer')
  )
);

-- RLS Policies for Guild Messages
ALTER TABLE guild_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild members can view guild messages" ON guild_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM guild_members
    WHERE guild_members.guild_id = guild_messages.guild_id
    AND guild_members.user_id = auth.uid()
  )
);

CREATE POLICY "Guild members can send messages" ON guild_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM guild_members
    WHERE guild_members.guild_id = guild_messages.guild_id
    AND guild_members.user_id = auth.uid()
  )
);

-- RLS Policies for Prestige Records
ALTER TABLE prestige_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prestige" ON prestige_records
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prestige" ON prestige_records
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prestige" ON prestige_records
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Cosmetic Items
ALTER TABLE cosmetic_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cosmetics" ON cosmetic_items
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock cosmetics" ON cosmetic_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cosmetics" ON cosmetic_items
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Hall of Fame
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view hall of fame" ON hall_of_fame
FOR SELECT USING (true);

CREATE POLICY "Users can add their own records" ON hall_of_fame
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON hall_of_fame
FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for guild messages
ALTER TABLE guild_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE guild_messages;

-- Triggers for updated_at
CREATE TRIGGER update_guilds_updated_at
BEFORE UPDATE ON guilds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prestige_records_updated_at
BEFORE UPDATE ON prestige_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_boss_leaderboard_updated_at
BEFORE UPDATE ON boss_leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();