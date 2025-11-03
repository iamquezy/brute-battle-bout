-- Sprint 2: Add character customization fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stat_allocation jsonb DEFAULT '{"str": 0, "dex": 0, "int": 0, "vit": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS starter_pet_id text,
ADD COLUMN IF NOT EXISTS appearance jsonb DEFAULT '{"hair": "brown", "skin": "medium", "weapon": "default"}'::jsonb;

-- Sprint 3: Class Evolution System
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS class_tier integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS subclass text,
ADD COLUMN IF NOT EXISTS class_evolution_history jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS class_evolution_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier integer NOT NULL,
  quest_type text NOT NULL,
  progress jsonb DEFAULT '{}'::jsonb,
  requirements jsonb NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE class_evolution_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evolution quests"
  ON class_evolution_quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evolution quests"
  ON class_evolution_quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evolution quests"
  ON class_evolution_quests FOR UPDATE
  USING (auth.uid() = user_id);

-- Sprint 4: PvP Tickets System
CREATE TABLE IF NOT EXISTS pvp_tickets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tickets integer DEFAULT 3 CHECK (tickets >= 0),
  last_refill timestamptz DEFAULT now(),
  total_used integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pvp_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON pvp_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets"
  ON pvp_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON pvp_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Sprint 4: Tournament System
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  rewards jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  placement integer,
  points integer DEFAULT 0,
  claimed_reward boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are viewable by everyone"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Participants can view tournament entries"
  ON tournament_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON tournament_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tournament entry"
  ON tournament_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to refill PvP tickets daily
CREATE OR REPLACE FUNCTION refill_pvp_tickets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pvp_tickets
  SET 
    tickets = LEAST(tickets + 3, 10),
    last_refill = now()
  WHERE last_refill < now() - interval '24 hours';
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pvp_tickets_user ON pvp_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_class_evolution_quests_user ON class_evolution_quests(user_id);