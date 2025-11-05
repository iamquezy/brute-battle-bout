import { Equipment } from '@/types/equipment';
import { 
  EnhancementResult, 
  MAX_ENHANCEMENT_LEVEL, 
  ENHANCEMENT_SUCCESS_RATES, 
  ENHANCEMENT_COSTS,
  ENHANCEMENT_STAT_BONUS 
} from '@/types/enhancement';
import { CraftingMaterials } from '@/types/crafting';

// Re-export for convenience
export { MAX_ENHANCEMENT_LEVEL, ENHANCEMENT_SUCCESS_RATES, ENHANCEMENT_COSTS } from '@/types/enhancement';

export const canEnhance = (
  equipment: Equipment,
  playerGold: number,
  materials: CraftingMaterials
): { canEnhance: boolean; reason?: string } => {
  if (!equipment.enhancementLevel) {
    equipment.enhancementLevel = 0;
  }

  if (equipment.enhancementLevel >= MAX_ENHANCEMENT_LEVEL) {
    return { canEnhance: false, reason: 'Maximum enhancement level reached' };
  }

  const cost = ENHANCEMENT_COSTS[equipment.enhancementLevel];
  
  if (playerGold < cost.gold) {
    return { canEnhance: false, reason: `Not enough gold (need ${cost.gold})` };
  }

  if (cost.materials) {
    for (const [material, amount] of Object.entries(cost.materials)) {
      const materialKey = material as keyof CraftingMaterials;
      if (materials[materialKey] < amount) {
        return { canEnhance: false, reason: `Not enough ${material.replace('_', ' ')}` };
      }
    }
  }

  return { canEnhance: true };
};

export const attemptEnhancement = (
  equipment: Equipment,
  useProtection: boolean = false
): EnhancementResult => {
  if (!equipment.enhancementLevel) {
    equipment.enhancementLevel = 0;
  }

  const currentLevel = equipment.enhancementLevel;
  const successRate = ENHANCEMENT_SUCCESS_RATES[currentLevel];
  const roll = Math.random() * 100;

  if (roll <= successRate) {
    // Success!
    return {
      success: true,
      newLevel: currentLevel + 1,
      message: `Enhancement successful! ${equipment.name} is now +${currentLevel + 1}`,
    };
  } else {
    // Failure
    if (currentLevel >= 6 && !useProtection) {
      // High level failures destroy the item (unless protected)
      return {
        success: false,
        newLevel: 0,
        destroyed: true,
        message: `Enhancement failed! ${equipment.name} was destroyed!`,
      };
    } else if (currentLevel >= 4) {
      // Mid level failures decrease enhancement
      const newLevel = Math.max(0, currentLevel - 1);
      return {
        success: false,
        newLevel,
        message: `Enhancement failed! ${equipment.name} downgraded to +${newLevel}`,
      };
    } else {
      // Low level failures just fail without penalty
      return {
        success: false,
        newLevel: currentLevel,
        message: `Enhancement failed! No penalty.`,
      };
    }
  }
};

export const calculateEnhancedStats = (equipment: Equipment): Equipment => {
  if (!equipment.enhancementLevel || equipment.enhancementLevel === 0) {
    return equipment;
  }

  const bonus = 1 + (equipment.enhancementLevel * ENHANCEMENT_STAT_BONUS);
  const enhancedStats = { ...equipment.stats };

  Object.keys(enhancedStats).forEach(key => {
    const statKey = key as keyof typeof enhancedStats;
    if (enhancedStats[statKey]) {
      enhancedStats[statKey] = Math.floor(enhancedStats[statKey]! * bonus);
    }
  });

  return {
    ...equipment,
    stats: enhancedStats,
  };
};

export const getEnhancementGlow = (level: number): string => {
  if (level >= 9) return 'shadow-[0_0_20px_rgba(255,215,0,0.8)] border-yellow-500';
  if (level >= 7) return 'shadow-[0_0_15px_rgba(147,51,234,0.7)] border-purple-500';
  if (level >= 5) return 'shadow-[0_0_12px_rgba(234,88,12,0.6)] border-orange-500';
  if (level >= 3) return 'shadow-[0_0_10px_rgba(59,130,246,0.5)] border-blue-500';
  if (level >= 1) return 'shadow-[0_0_8px_rgba(34,197,94,0.4)] border-green-500';
  return '';
};