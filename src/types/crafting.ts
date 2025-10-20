import { Rarity } from './equipment';

export type CraftingMaterial = 
  | 'common_shard' 
  | 'uncommon_shard' 
  | 'rare_shard' 
  | 'epic_shard' 
  | 'legendary_shard';

export interface CraftingMaterials {
  common_shard: number;
  uncommon_shard: number;
  rare_shard: number;
  epic_shard: number;
  legendary_shard: number;
}

export interface UpgradeCost {
  shards: number;
  gold: number;
}

export const DISMANTLE_REWARDS: Record<Rarity, number> = {
  common: 1,
  uncommon: 3,
  rare: 8,
  epic: 20,
  legendary: 50,
};

export const UPGRADE_COSTS: Record<Rarity, UpgradeCost | null> = {
  common: { shards: 5, gold: 100 },      // to uncommon
  uncommon: { shards: 10, gold: 250 },   // to rare
  rare: { shards: 20, gold: 500 },       // to epic
  epic: { shards: 40, gold: 1000 },      // to legendary
  legendary: null,                        // can't upgrade
};

export const REFORGE_COST = {
  shardMultiplier: 5, // 5 shards of item's rarity
  gold: 50,
};

export const ENCHANT_COST = {
  rareShards: 10,
  gold: 200,
};

export type EnchantmentType = 'all_stats' | 'lucky_strike' | 'fortified' | 'swift';

export interface Enchantment {
  id: EnchantmentType;
  name: string;
  description: string;
  effect: string;
}

export const ENCHANTMENTS: Record<EnchantmentType, Enchantment> = {
  all_stats: {
    id: 'all_stats',
    name: '+5% All Stats',
    description: 'Increases all stats by 5%',
    effect: '+5% to all stats',
  },
  lucky_strike: {
    id: 'lucky_strike',
    name: 'Lucky Strike',
    description: 'Increase critical hit chance',
    effect: '+10% crit chance',
  },
  fortified: {
    id: 'fortified',
    name: 'Fortified',
    description: 'Boost defense significantly',
    effect: '+15% defense',
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    description: 'Increase speed and evasion',
    effect: '+10% speed, +5% evasion',
  },
};
