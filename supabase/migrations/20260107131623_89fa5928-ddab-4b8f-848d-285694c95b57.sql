-- Trading system tables

-- Trade requests table for direct player-to-player trades
CREATE TABLE public.trade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_items JSONB NOT NULL DEFAULT '[]',
  receiver_items JSONB NOT NULL DEFAULT '[]',
  sender_gold INTEGER NOT NULL DEFAULT 0,
  receiver_gold INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_data JSONB NOT NULL,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE
);

-- Dungeon runs table
CREATE TABLE public.dungeon_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dungeon_id TEXT NOT NULL,
  current_floor INTEGER NOT NULL DEFAULT 1,
  max_floor_reached INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  combat_log JSONB NOT NULL DEFAULT '[]',
  rewards JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dungeon_runs ENABLE ROW LEVEL SECURITY;

-- Trade requests policies
CREATE POLICY "Users can view their own trade requests"
  ON public.trade_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create trade requests"
  ON public.trade_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own trade requests"
  ON public.trade_requests FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Marketplace policies
CREATE POLICY "Anyone can view active marketplace listings"
  ON public.marketplace_listings FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can create marketplace listings"
  ON public.marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
  ON public.marketplace_listings FOR UPDATE
  USING (auth.uid() = seller_id OR (status = 'active' AND buyer_id IS NULL));

-- Dungeon runs policies
CREATE POLICY "Users can view their own dungeon runs"
  ON public.dungeon_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create dungeon runs"
  ON public.dungeon_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dungeon runs"
  ON public.dungeon_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_trade_requests_sender ON public.trade_requests(sender_id);
CREATE INDEX idx_trade_requests_receiver ON public.trade_requests(receiver_id);
CREATE INDEX idx_marketplace_status ON public.marketplace_listings(status);
CREATE INDEX idx_dungeon_runs_user ON public.dungeon_runs(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_trade_requests_updated_at
  BEFORE UPDATE ON public.trade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();