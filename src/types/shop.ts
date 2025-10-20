export type ShopItemType = 'consumable' | 'buff' | 'service';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  price: number;
  icon: string;
  effect: {
    type: 'heal' | 'exp-boost' | 'reroll' | 'skill-token' | 'arena-pass';
    value?: number;
    duration?: number; // for buffs, in number of battles
  };
}

export interface ActiveBuff {
  id: string;
  name: string;
  type: 'exp-boost';
  multiplier: number;
  battlesRemaining: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'health-potion',
    name: 'Health Potion',
    description: 'Restore full health instantly',
    type: 'consumable',
    price: 50,
    icon: '🧪',
    effect: {
      type: 'heal',
    },
  },
  {
    id: 'exp-boost',
    name: 'Experience Boost',
    description: 'Gain +50% exp for next 3 battles',
    type: 'buff',
    price: 100,
    icon: '⭐',
    effect: {
      type: 'exp-boost',
      value: 1.5,
      duration: 3,
    },
  },
  {
    id: 'stat-reroll',
    name: 'Stat Reroll',
    description: 'Reroll stats on a random inventory item',
    type: 'service',
    price: 150,
    icon: '🎲',
    effect: {
      type: 'reroll',
    },
  },
  {
    id: 'skill-token',
    name: 'Skill Token',
    description: 'Guarantee a random skill unlock',
    type: 'consumable',
    price: 200,
    icon: '🎯',
    effect: {
      type: 'skill-token',
    },
  },
];
