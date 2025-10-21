import { Character } from '@/types/game';

export interface PvPRewards {
  gold: number;
  experience: number;
  materials?: {
    type: string;
    amount: number;
  };
  streakBonus?: number;
}

export function calculatePvPRewards(
  winner: Character,
  loser: Character,
  ratingDifference: number,
  currentWinStreak: number = 0
): PvPRewards {
  const baseGold = 50;
  const baseExp = 50;

  // Rating difference modifier (higher rated opponent = better rewards)
  const ratingMod = Math.max(0.5, Math.min(2, 1 + ratingDifference / 200));

  // Level difference modifier
  const levelMod = Math.max(0.8, Math.min(1.5, loser.level / winner.level));

  // Calculate rewards
  let gold = Math.floor(baseGold * ratingMod * levelMod);
  let experience = Math.floor(baseExp * levelMod + loser.level * 10);

  // Win streak bonus
  let streakBonus = 0;
  if (currentWinStreak >= 3) {
    streakBonus = Math.floor(gold * 0.2 * Math.min(currentWinStreak / 3, 3));
    gold += streakBonus;
  }

  // Random crafting material based on opponent level and rating
  let materials: PvPRewards['materials'] | undefined;
  const materialChance = Math.min(0.7, 0.3 + (loser.level * 0.02));
  
  if (Math.random() < materialChance) {
    const materialTypes = ['common_shard', 'uncommon_shard', 'rare_shard', 'epic_shard', 'legendary_shard'];
    const rarityRoll = Math.random();
    
    let materialType: string;
    let amount: number;

    if (rarityRoll < 0.4) {
      materialType = 'common_shard';
      amount = Math.floor(2 + Math.random() * 3);
    } else if (rarityRoll < 0.7) {
      materialType = 'uncommon_shard';
      amount = Math.floor(1 + Math.random() * 2);
    } else if (rarityRoll < 0.9) {
      materialType = 'rare_shard';
      amount = 1;
    } else if (rarityRoll < 0.97) {
      materialType = 'epic_shard';
      amount = 1;
    } else {
      materialType = 'legendary_shard';
      amount = 1;
    }

    materials = { type: materialType, amount };
  }

  return {
    gold,
    experience,
    materials,
    streakBonus
  };
}

export function formatMaterialName(materialType: string): string {
  return materialType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
