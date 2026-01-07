import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WORLD_BOSSES = [
  {
    id: 'ancient_dragon',
    name: 'Ancient Dragon',
    health: 50000000,
  },
  {
    id: 'titan_colossus',
    name: 'Titan Colossus',
    health: 75000000,
  },
  {
    id: 'void_lord',
    name: 'Void Lord',
    health: 100000000,
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for active world boss...');

    // Check if there's an active world boss
    const { data: activeBoss, error: fetchError } = await supabase
      .from('world_bosses')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching active boss:', fetchError);
      throw fetchError;
    }

    if (activeBoss) {
      console.log('Active boss already exists:', activeBoss.boss_id);
      return new Response(
        JSON.stringify({ 
          message: 'Active world boss already exists', 
          boss: activeBoss 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No active boss - spawn a new one
    const randomBoss = WORLD_BOSSES[Math.floor(Math.random() * WORLD_BOSSES.length)];
    
    console.log('Spawning new world boss:', randomBoss.id);

    const { data: newBoss, error: insertError } = await supabase
      .from('world_bosses')
      .insert({
        boss_id: randomBoss.id,
        current_health: randomBoss.health,
        max_health: randomBoss.health,
        status: 'active',
        total_damage: 0,
        total_participants: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error spawning boss:', insertError);
      throw insertError;
    }

    console.log('World boss spawned successfully:', newBoss);

    return new Response(
      JSON.stringify({ 
        message: 'New world boss spawned!', 
        boss: newBoss 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in spawn-world-boss function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
