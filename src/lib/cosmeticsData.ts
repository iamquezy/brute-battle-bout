export interface CosmeticItem {
  id: string;
  name: string;
  type: 'skin' | 'title' | 'effect' | 'avatar_frame';
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockMethod: string;
  cost?: number; // gold cost if purchasable
  requirementLevel?: number;
  requirementPrestige?: number;
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // Skins
  {
    id: 'warrior_crimson',
    name: 'Crimson Warrior',
    type: 'skin',
    description: 'Blood-red armor for the warrior',
    rarity: 'rare',
    unlockMethod: 'Purchase from shop',
    cost: 1000,
    requirementLevel: 10
  },
  {
    id: 'mage_arcane',
    name: 'Arcane Sage',
    type: 'skin',
    description: 'Mystical robes crackling with power',
    rarity: 'epic',
    unlockMethod: 'Purchase from shop',
    cost: 2500,
    requirementLevel: 20
  },
  {
    id: 'archer_shadow',
    name: 'Shadow Stalker',
    type: 'skin',
    description: 'Stealthy dark leather armor',
    rarity: 'epic',
    unlockMethod: 'Purchase from shop',
    cost: 2500,
    requirementLevel: 20
  },
  
  // Titles
  {
    id: 'title_novice',
    name: 'The Novice',
    type: 'title',
    description: 'Starting title for all adventurers',
    rarity: 'common',
    unlockMethod: 'Default',
    cost: 0
  },
  {
    id: 'title_veteran',
    name: 'The Veteran',
    type: 'title',
    description: 'For experienced fighters',
    rarity: 'rare',
    unlockMethod: 'Reach level 25',
    requirementLevel: 25
  },
  {
    id: 'title_champion',
    name: 'The Champion',
    type: 'title',
    description: 'Master of combat',
    rarity: 'epic',
    unlockMethod: 'Win 50 PvP matches',
    cost: 5000,
    requirementLevel: 30
  },
  {
    id: 'title_legend',
    name: 'The Legend',
    type: 'title',
    description: 'Mythical warrior status',
    rarity: 'legendary',
    unlockMethod: 'Prestige 3 times',
    requirementPrestige: 3
  },
  {
    id: 'title_boss_slayer',
    name: 'Boss Slayer',
    type: 'title',
    description: 'Defeated all bosses',
    rarity: 'legendary',
    unlockMethod: 'Defeat all raid bosses'
  },
  
  // Effects
  {
    id: 'frost_aura',
    name: 'Frost Aura',
    type: 'effect',
    description: 'Icy particles surround your character',
    rarity: 'rare',
    unlockMethod: 'Defeat Frost Dragon'
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    type: 'effect',
    description: 'Dark mist emanates from your character',
    rarity: 'epic',
    unlockMethod: 'Defeat Shadow Lord'
  },
  {
    id: 'divine_wings',
    name: 'Divine Wings',
    type: 'effect',
    description: 'Ethereal wings of light',
    rarity: 'legendary',
    unlockMethod: 'Defeat Celestial Guardian'
  },
  {
    id: 'holy_aura',
    name: 'Holy Aura',
    type: 'effect',
    description: 'Radiant holy light',
    rarity: 'legendary',
    unlockMethod: 'Defeat Celestial Guardian'
  },
  {
    id: 'fire_trail',
    name: 'Flame Trail',
    type: 'effect',
    description: 'Leaves a trail of fire',
    rarity: 'epic',
    unlockMethod: 'Purchase from shop',
    cost: 3000,
    requirementLevel: 25
  },
  
  // Avatar Frames
  {
    id: 'frame_bronze',
    name: 'Bronze Frame',
    type: 'avatar_frame',
    description: 'Simple bronze border',
    rarity: 'common',
    unlockMethod: 'Default',
    cost: 0
  },
  {
    id: 'frame_silver',
    name: 'Silver Frame',
    type: 'avatar_frame',
    description: 'Elegant silver border',
    rarity: 'rare',
    unlockMethod: 'Purchase from shop',
    cost: 500,
    requirementLevel: 15
  },
  {
    id: 'frame_gold',
    name: 'Gold Frame',
    type: 'avatar_frame',
    description: 'Luxurious gold border',
    rarity: 'epic',
    unlockMethod: 'Purchase from shop',
    cost: 2000,
    requirementLevel: 25
  },
  {
    id: 'frame_diamond',
    name: 'Diamond Frame',
    type: 'avatar_frame',
    description: 'Sparkling diamond border',
    rarity: 'legendary',
    unlockMethod: 'Prestige 5 times',
    requirementPrestige: 5
  }
];

export function getCosmeticById(id: string): CosmeticItem | undefined {
  return COSMETIC_ITEMS.find(item => item.id === id);
}

export function getCosmeticsByType(type: CosmeticItem['type']): CosmeticItem[] {
  return COSMETIC_ITEMS.filter(item => item.type === type);
}

export function getPurchasableCosmetics(playerLevel: number): CosmeticItem[] {
  return COSMETIC_ITEMS.filter(item => 
    item.cost !== undefined && 
    item.cost > 0 &&
    (!item.requirementLevel || playerLevel >= item.requirementLevel)
  );
}
