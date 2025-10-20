export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PetBonuses {
  attack?: number;
  defense?: number;
  speed?: number;
  health?: number;
  evasion?: number;
  critChance?: number;
  luck?: number;
  expMultiplier?: number;
  reviveOnce?: boolean;
}

export interface Pet {
  id: string;
  name: string;
  rarity: PetRarity;
  description: string;
  emoji: string;
  level: number;
  experience: number;
  bonuses: PetBonuses;
}

export const PET_DROP_RATES: Record<PetRarity, number> = {
  common: 0.05,      // 5%
  rare: 0.02,        // 2%
  epic: 0.005,       // 0.5%
  legendary: 0.001,  // 0.1%
};

export const PET_LEVEL_REQUIREMENT = 200; // exp per level
