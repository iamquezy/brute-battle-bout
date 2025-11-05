-- Create saved_builds table for storing player build configurations
CREATE TABLE IF NOT EXISTS public.saved_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  character_class TEXT NOT NULL,
  character_level INTEGER NOT NULL DEFAULT 1,
  character_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_builds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own builds"
  ON public.saved_builds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own builds"
  ON public.saved_builds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own builds"
  ON public.saved_builds
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own builds"
  ON public.saved_builds
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_saved_builds_user_id ON public.saved_builds(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_builds_updated_at
  BEFORE UPDATE ON public.saved_builds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();