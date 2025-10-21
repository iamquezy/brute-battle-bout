import { supabase } from '@/integrations/supabase/client';

export interface HallOfFameEntry {
  id: string;
  user_id: string;
  username: string;
  category: 'legendary_warrior' | 'guild_master' | 'boss_slayer' | 'prestige_champion';
  achievement_data: any;
  recorded_at: string;
}

export const HALL_OF_FAME_CATEGORIES = {
  legendary_warrior: {
    name: 'Legendary Warrior',
    description: 'Reached level 100 with 1000+ PvP victories',
    icon: '⚔️',
    requirement: 'Level 100 + 1000 PvP wins'
  },
  guild_master: {
    name: 'Guild Master',
    description: 'Led a guild to level 10',
    icon: '👑',
    requirement: 'Guild Level 10'
  },
  boss_slayer: {
    name: 'Boss Slayer',
    description: 'Defeated all raid bosses',
    icon: '🐉',
    requirement: 'Defeat all bosses'
  },
  prestige_champion: {
    name: 'Prestige Champion',
    description: 'Reached prestige level 10',
    icon: '⭐',
    requirement: 'Prestige 10'
  }
};

export async function addToHallOfFame(
  userId: string,
  username: string,
  category: HallOfFameEntry['category'],
  achievementData: any
): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('hall_of_fame')
      .select('id')
      .eq('user_id', userId)
      .eq('category', category)
      .maybeSingle();

    if (existing) {
      // Update existing entry
      const { error } = await supabase
        .from('hall_of_fame')
        .update({
          achievement_data: achievementData,
          recorded_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('category', category);

      return !error;
    } else {
      // Create new entry
      const { error } = await supabase
        .from('hall_of_fame')
        .insert({
          user_id: userId,
          username,
          category,
          achievement_data: achievementData
        });

      return !error;
    }
  } catch (error) {
    console.error('Error adding to hall of fame:', error);
    return false;
  }
}

export async function getHallOfFame(category?: HallOfFameEntry['category']): Promise<HallOfFameEntry[]> {
  try {
    let query = supabase
      .from('hall_of_fame')
      .select('*')
      .order('recorded_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as HallOfFameEntry[];
  } catch (error) {
    console.error('Error fetching hall of fame:', error);
    return [];
  }
}

export async function checkHallOfFameEligibility(
  userId: string,
  playerData: any
): Promise<{ eligible: boolean; categories: HallOfFameEntry['category'][] }> {
  const eligibleCategories: HallOfFameEntry['category'][] = [];

  // Check Legendary Warrior
  if (playerData.level >= 100 && playerData.pvpWins >= 1000) {
    eligibleCategories.push('legendary_warrior');
  }

  // Check Boss Slayer
  const { data: bossVictories } = await supabase
    .from('boss_fights')
    .select('boss_id')
    .eq('user_id', userId)
    .eq('victory', true);

  const uniqueBosses = new Set(bossVictories?.map(v => v.boss_id) || []);
  if (uniqueBosses.size >= 4) { // If defeated all 4 bosses
    eligibleCategories.push('boss_slayer');
  }

  // Check Prestige Champion
  const { data: prestige } = await supabase
    .from('prestige_records')
    .select('prestige_level')
    .eq('user_id', userId)
    .maybeSingle();

  if (prestige && prestige.prestige_level >= 10) {
    eligibleCategories.push('prestige_champion');
  }

  // Check Guild Master
  const { data: guild } = await supabase
    .from('guild_members')
    .select('guild_id, rank')
    .eq('user_id', userId)
    .eq('rank', 'leader')
    .maybeSingle();

  if (guild) {
    const { data: guildInfo } = await supabase
      .from('guilds')
      .select('level')
      .eq('id', guild.guild_id)
      .single();

    if (guildInfo && guildInfo.level >= 10) {
      eligibleCategories.push('guild_master');
    }
  }

  return {
    eligible: eligibleCategories.length > 0,
    categories: eligibleCategories
  };
}
