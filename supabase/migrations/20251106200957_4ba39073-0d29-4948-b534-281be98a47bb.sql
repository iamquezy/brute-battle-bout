-- Create world bosses table
CREATE TABLE public.world_bosses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boss_id TEXT NOT NULL,
  current_health BIGINT NOT NULL,
  max_health BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  spawned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  defeated_at TIMESTAMP WITH TIME ZONE,
  total_participants INTEGER NOT NULL DEFAULT 0,
  total_damage BIGINT NOT NULL DEFAULT 0
);

-- Create world boss participants table
CREATE TABLE public.world_boss_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boss_id UUID NOT NULL REFERENCES public.world_bosses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  damage_dealt BIGINT NOT NULL DEFAULT 0,
  attacks_made INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(boss_id, user_id)
);

-- Create seasonal events table
CREATE TABLE public.seasonal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seasonal event participants table
CREATE TABLE public.seasonal_event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.seasonal_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  rewards_claimed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create mythic plus runs table
CREATE TABLE public.mythic_plus_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dungeon_id TEXT NOT NULL,
  keystone_level INTEGER NOT NULL,
  completion_time INTEGER NOT NULL,
  deaths INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL,
  rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.world_bosses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_boss_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mythic_plus_runs ENABLE ROW LEVEL SECURITY;

-- World bosses policies
CREATE POLICY "Everyone can view world bosses"
ON public.world_bosses FOR SELECT
USING (true);

CREATE POLICY "System can manage world bosses"
ON public.world_bosses FOR ALL
USING (true);

-- World boss participants policies
CREATE POLICY "Everyone can view participants"
ON public.world_boss_participants FOR SELECT
USING (true);

CREATE POLICY "Users can join world boss"
ON public.world_boss_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
ON public.world_boss_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Seasonal events policies
CREATE POLICY "Everyone can view seasonal events"
ON public.seasonal_events FOR SELECT
USING (true);

-- Seasonal event participants policies
CREATE POLICY "Users can view event participants"
ON public.seasonal_event_participants FOR SELECT
USING (true);

CREATE POLICY "Users can join events"
ON public.seasonal_event_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their event progress"
ON public.seasonal_event_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Mythic plus runs policies
CREATE POLICY "Users can view their own runs"
ON public.mythic_plus_runs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create runs"
ON public.mythic_plus_runs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view top runs"
ON public.mythic_plus_runs FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_world_bosses_status ON public.world_bosses(status);
CREATE INDEX idx_world_boss_participants_boss_id ON public.world_boss_participants(boss_id);
CREATE INDEX idx_world_boss_participants_damage ON public.world_boss_participants(damage_dealt DESC);
CREATE INDEX idx_seasonal_events_dates ON public.seasonal_events(start_date, end_date);
CREATE INDEX idx_seasonal_events_status ON public.seasonal_events(status);
CREATE INDEX idx_mythic_plus_runs_score ON public.mythic_plus_runs(score DESC);
CREATE INDEX idx_mythic_plus_runs_user ON public.mythic_plus_runs(user_id);