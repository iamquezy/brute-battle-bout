import { StatType } from './game';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EquipmentType = 'weapon' | 'armor' | 'accessory';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: Rarity;
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    evasion?: number;
    critChance?: number;
    luck?: number;
  };
  enhancementLevel?: number; // +0 to +10
}

export interface EquipmentSlots {
  weapon: Equipment | null;
  armor: Equipment | null;
  accessory: Equipment | null;
}

export const RARITY_CHANCES: Record<Rarity, number> = {
  common: 0.50,      // 50%
  uncommon: 0.30,    // 30%
  rare: 0.15,        // 15%
  epic: 0.04,        // 4%
  legendary: 0.01,   // 1%
};

export const RARITY_STAT_MULTIPLIERS: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2.5,
  epic: 4,
  legendary: 6,
};
