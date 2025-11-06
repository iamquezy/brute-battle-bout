-- Create guild raids table
CREATE TABLE public.guild_raids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  raid_boss_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  boss_health INTEGER NOT NULL,
  boss_max_health INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  rewards_claimed BOOLEAN NOT NULL DEFAULT false,
  participant_count INTEGER NOT NULL DEFAULT 0,
  total_damage INTEGER NOT NULL DEFAULT 0
);

-- Create guild raid participants table
CREATE TABLE public.guild_raid_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raid_id UUID NOT NULL REFERENCES public.guild_raids(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  attacks_made INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(raid_id, user_id)
);

-- Create leaderboard rewards table
CREATE TABLE public.leaderboard_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  season TEXT NOT NULL,
  rank INTEGER NOT NULL,
  rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guild_raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_raid_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_rewards ENABLE ROW LEVEL SECURITY;

-- Guild raids policies
CREATE POLICY "Guild members can view their guild raids"
ON public.guild_raids FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM guild_members
    WHERE guild_members.guild_id = guild_raids.guild_id
    AND guild_members.user_id = auth.uid()
  )
);

CREATE POLICY "Guild leaders can create raids"
ON public.guild_raids FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM guilds
    WHERE guilds.id = guild_raids.guild_id
    AND guilds.leader_id = auth.uid()
  )
);

CREATE POLICY "Guild members can update raids"
ON public.guild_raids FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM guild_members
    WHERE guild_members.guild_id = guild_raids.guild_id
    AND guild_members.user_id = auth.uid()
  )
);

-- Guild raid participants policies
CREATE POLICY "Guild members can view raid participants"
ON public.guild_raid_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM guild_raids gr
    JOIN guild_members gm ON gm.guild_id = gr.guild_id
    WHERE gr.id = guild_raid_participants.raid_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join raids"
ON public.guild_raid_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
ON public.guild_raid_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Leaderboard rewards policies
CREATE POLICY "Users can view their own rewards"
ON public.leaderboard_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can claim their rewards"
ON public.leaderboard_rewards FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_guild_raids_guild_id ON public.guild_raids(guild_id);
CREATE INDEX idx_guild_raids_status ON public.guild_raids(status);
CREATE INDEX idx_guild_raid_participants_raid_id ON public.guild_raid_participants(raid_id);
CREATE INDEX idx_guild_raid_participants_user_id ON public.guild_raid_participants(user_id);
CREATE INDEX idx_leaderboard_rewards_user_id ON public.leaderboard_rewards(user_id);
CREATE INDEX idx_leaderboard_rewards_season ON public.leaderboard_rewards(season);