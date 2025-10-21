-- Step 1: Create a public player preview view for matchmaking
CREATE OR REPLACE VIEW public_player_preview AS
SELECT 
  id,
  username,
  (character_data->'character'->>'level')::int as level,
  character_data->'character'->>'class' as class
FROM profiles;

-- Step 2: Restrict profile visibility - only self and friends can see full profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view friends profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM friend_requests 
    WHERE status = 'accepted' 
    AND (
      (sender_id = auth.uid() AND receiver_id = profiles.id) OR 
      (receiver_id = auth.uid() AND sender_id = profiles.id)
    )
  )
);

-- Step 3: Allow public read access to the player preview view
GRANT SELECT ON public_player_preview TO authenticated;
GRANT SELECT ON public_player_preview TO anon;