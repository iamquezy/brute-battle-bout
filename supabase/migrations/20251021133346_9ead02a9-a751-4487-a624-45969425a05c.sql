-- Fix security definer view by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public_player_preview;

CREATE VIEW public_player_preview 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  (character_data->'character'->>'level')::int as level,
  character_data->'character'->>'class' as class
FROM profiles;

-- Grant access to the view
GRANT SELECT ON public_player_preview TO authenticated;
GRANT SELECT ON public_player_preview TO anon;