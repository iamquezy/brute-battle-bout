import { supabase } from '@/integrations/supabase/client';
import { Character } from '@/types/game';
import { loadGame } from './saveGame';

export interface CloudProfile {
  username: string;
  character_data: {
    character: Character | null;
    inventory: any[];
    equippedItems: any;
    battleHistory: any[];
    acquiredSkills: string[];
    activeBuffs: any[];
    dailyQuests: any[];
    weeklyQuests: any[];
    achievements: any[];
    equippedTitle: string | null;
    collectedPets: any[];
    activePet: any | null;
    craftingMaterials: any;
    skillTreeNodes: any[];
    skillPoints: number;
    achievementStats: any;
    lastDailyReset: number;
    lastWeeklyReset: number;
  };
}

export const createProfile = async (userId: string, username: string): Promise<boolean> => {
  try {
    // Load existing localStorage data
    const localData = loadGame();
    
    const character_data = localData ? {
      character: localData.player,
      inventory: localData.inventory,
      equippedItems: localData.equippedItems,
      battleHistory: localData.battleHistory,
      acquiredSkills: localData.acquiredSkills,
      activeBuffs: localData.activeBuffs,
      dailyQuests: localData.dailyQuests,
      weeklyQuests: localData.weeklyQuests,
      achievements: localData.achievements,
      equippedTitle: localData.equippedTitle,
      collectedPets: localData.collectedPets,
      activePet: localData.activePet,
      craftingMaterials: localData.craftingMaterials,
      skillTreeNodes: localData.skillTreeNodes,
      skillPoints: localData.skillPoints,
      achievementStats: localData.achievementStats,
      lastDailyReset: localData.lastDailyReset,
      lastWeeklyReset: localData.lastWeeklyReset,
    } : {
      character: null,
      inventory: [],
      equippedItems: { weapon: null, armor: null, accessory: null },
      battleHistory: [],
      acquiredSkills: [],
      activeBuffs: [],
      dailyQuests: [],
      weeklyQuests: [],
      achievements: [],
      equippedTitle: null,
      collectedPets: [],
      activePet: null,
      craftingMaterials: { common_shard: 0, uncommon_shard: 0, rare_shard: 0, epic_shard: 0, legendary_shard: 0 },
      skillTreeNodes: [],
      skillPoints: 0,
      achievementStats: {
        totalWins: 0, totalLosses: 0, totalDamageDealt: 0, criticalHits: 0,
        attacksEvaded: 0, itemsFound: 0, legendaryItemsOwned: 0, skillsAcquired: 0,
        goldEarned: 0, lowHealthWins: 0
      },
      lastDailyReset: Date.now(),
      lastWeeklyReset: Date.now(),
    };

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        character_data: character_data as any,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating profile:', error);
    return false;
  }
};

export const loadProfile = async (userId: string): Promise<CloudProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as any;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
};

export const saveProfile = async (userId: string, characterData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ character_data: characterData })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

export const updateLeaderboard = async (
  userId: string,
  username: string,
  stats: { level: number; wins: number; losses: number; gold: number; rating?: number }
): Promise<boolean> => {
  try {
    const score = (stats.wins * 10) + (stats.level * 5) + Math.floor(stats.gold / 100);
    const rating = stats.rating || 1000;

    const { error } = await supabase
      .from('leaderboard')
      .upsert({
        user_id: userId,
        username,
        score,
        wins: stats.wins,
        losses: stats.losses,
        level: stats.level,
        rating,
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return false;
  }
};
