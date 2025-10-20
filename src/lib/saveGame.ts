import { Character } from '@/types/game';
import { Equipment } from '@/types/equipment';
import { ShopItem, ActiveBuff } from '@/types/shop';
import { Quest } from '@/types/quests';
import { Achievement, AchievementStats } from '@/types/achievements';
import { Pet } from '@/types/pets';
import { SkillTreeNode } from '@/types/skillTree';

const SAVE_KEY = 'arena_legends_save';
const SAVE_VERSION = 1;

export interface GameSaveState {
  version: number;
  timestamp: number;
  player: Character | null;
  inventory: Equipment[];
  equippedItems: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };
  battleHistory: Array<{
    opponent: string;
    result: 'victory' | 'defeat';
    timestamp: number;
  }>;
  acquiredSkills: string[];
  activeBuffs: ActiveBuff[];
  shopItems: ShopItem[];
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  achievements: Achievement[];
  equippedTitle: string | null;
  collectedPets: Pet[];
  activePet: Pet | null;
  craftingMaterials: {
    common_shard: number;
    uncommon_shard: number;
    rare_shard: number;
    epic_shard: number;
    legendary_shard: number;
  };
  skillTreeNodes: SkillTreeNode[];
  skillPoints: number;
  achievementStats: AchievementStats;
  lastDailyReset: number;
  lastWeeklyReset: number;
}

export const saveGame = (state: Omit<GameSaveState, 'version' | 'timestamp'>): boolean => {
  try {
    const saveData: GameSaveState = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      ...state,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
};

export const loadGame = (): GameSaveState | null => {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;

    const parsed: GameSaveState = JSON.parse(savedData);
    
    // Version check (for future migrations)
    if (parsed.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, starting fresh');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const clearGame = (): boolean => {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear game:', error);
    return false;
  }
};

export const hasSavedGame = (): boolean => {
  return localStorage.getItem(SAVE_KEY) !== null;
};
