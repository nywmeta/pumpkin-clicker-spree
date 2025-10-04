import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BOSS_NAMES = [
  'The Pumpkin King',
  'Karen Supreme',
  'Mega Snus Monster',
  'Traffic Demon Lord',
  'Nightmare Bed',
  'HR Final Boss',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if there's already an active raid boss
    const { data: existingBoss } = await supabaseClient
      .from('raid_bosses')
      .select('*')
      .eq('is_active', true)
      .single();

    if (existingBoss) {
      return new Response(
        JSON.stringify({ 
          message: 'Raid boss already active',
          boss: existingBoss 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Get highest stage from any player
    const { data: topPlayer } = await supabaseClient
      .from('player_progress')
      .select('current_stage')
      .order('current_stage', { ascending: false })
      .limit(1)
      .single();

    const bossStage = topPlayer?.current_stage || 1;
    const bossName = BOSS_NAMES[Math.floor(Math.random() * BOSS_NAMES.length)];
    
    // Calculate boss stats based on stage
    const maxHealth = Math.floor(1000000 * Math.pow(1.5, bossStage - 1));
    
    // Boss expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create new raid boss
    const { data: newBoss, error } = await supabaseClient
      .from('raid_bosses')
      .insert({
        boss_name: bossName,
        max_health: maxHealth,
        current_health: maxHealth,
        stage_level: bossStage,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('New raid boss spawned:', newBoss);

    return new Response(
      JSON.stringify({ 
        message: 'Raid boss spawned successfully',
        boss: newBoss 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error spawning raid boss:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
