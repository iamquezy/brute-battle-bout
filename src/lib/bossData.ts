export interface Boss {
  id: string;
  name: string;
  level: number;
  description: string;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  abilities: BossAbility[];
  rewards: BossReward;
  image: string;
}

export interface BossAbility {
  name: string;
  description: string;
  damage: number;
  effect?: 'stun' | 'poison' | 'burn' | 'freeze' | 'lifesteal' | 'enrage';
  chance: number;
}

export interface BossReward {
  gold: number;
  experience: number;
  materials: { [key: string]: number };
  prestigePoints?: number;
  cosmetics?: string[];
}

export const BOSSES: Boss[] = [
  {
    id: 'fire_titan',
    name: 'Fire Titan',
    level: 10,
    description: 'A massive elemental creature wreathed in flames',
    health: 500,
    attack: 45,
    defense: 20,
    speed: 10,
    abilities: [
      {
        name: 'Inferno Strike',
        description: 'Devastating fire attack',
        damage: 60,
        effect: 'burn',
        chance: 0.3
      },
      {
        name: 'Flame Shield',
        description: 'Reduces incoming damage',
        damage: 0,
        chance: 0.2
      }
    ],
    rewards: {
      gold: 500,
      experience: 300,
      materials: { 'fire_essence': 5, 'titan_core': 1 }
    },
    image: '/assets/bosses/fire_titan.jpg'
  },
  {
    id: 'frost_dragon',
    name: 'Frost Dragon',
    level: 20,
    description: 'Ancient dragon of ice and winter',
    health: 800,
    attack: 60,
    defense: 35,
    speed: 15,
    abilities: [
      {
        name: 'Ice Breath',
        description: 'Freezing cone attack',
        damage: 75,
        effect: 'freeze',
        chance: 0.35
      },
      {
        name: 'Frost Armor',
        description: 'Increases defense temporarily',
        damage: 0,
        chance: 0.25
      },
      {
        name: 'Tail Sweep',
        description: 'Physical AOE attack',
        damage: 50,
        effect: 'stun',
        chance: 0.2
      }
    ],
    rewards: {
      gold: 1000,
      experience: 600,
      materials: { 'dragon_scale': 3, 'ice_crystal': 5 },
      cosmetics: ['frost_aura']
    },
    image: '/assets/bosses/frost_dragon.jpg'
  },
  {
    id: 'shadow_lord',
    name: 'Shadow Lord',
    level: 30,
    description: 'Master of darkness and corruption',
    health: 1200,
    attack: 80,
    defense: 45,
    speed: 25,
    abilities: [
      {
        name: 'Shadow Strike',
        description: 'Ignores armor',
        damage: 100,
        chance: 0.3
      },
      {
        name: 'Life Drain',
        description: 'Steals health',
        damage: 60,
        effect: 'lifesteal',
        chance: 0.4
      },
      {
        name: 'Dark Enrage',
        description: 'Increases attack when low HP',
        damage: 0,
        effect: 'enrage',
        chance: 0.25
      }
    ],
    rewards: {
      gold: 2000,
      experience: 1000,
      materials: { 'shadow_essence': 8, 'dark_crystal': 2 },
      prestigePoints: 1,
      cosmetics: ['shadow_cloak']
    },
    image: '/assets/bosses/shadow_lord.jpg'
  },
  {
    id: 'celestial_guardian',
    name: 'Celestial Guardian',
    level: 50,
    description: 'Divine protector from the heavens',
    health: 2000,
    attack: 100,
    defense: 70,
    speed: 30,
    abilities: [
      {
        name: 'Holy Smite',
        description: 'Devastating light attack',
        damage: 120,
        chance: 0.35
      },
      {
        name: 'Divine Shield',
        description: 'Absorbs massive damage',
        damage: 0,
        chance: 0.3
      },
      {
        name: 'Judgment Ray',
        description: 'Piercing beam attack',
        damage: 90,
        effect: 'burn',
        chance: 0.25
      },
      {
        name: 'Resurrection',
        description: 'Heals when critically wounded',
        damage: 0,
        chance: 0.15
      }
    ],
    rewards: {
      gold: 5000,
      experience: 2500,
      materials: { 'celestial_ore': 10, 'divine_fragment': 3 },
      prestigePoints: 3,
      cosmetics: ['divine_wings', 'holy_aura']
    },
    image: '/assets/bosses/celestial_guardian.jpg'
  }
];

export function getBossById(bossId: string): Boss | undefined {
  return BOSSES.find(boss => boss.id === bossId);
}

export function getBossesByLevel(playerLevel: number): Boss[] {
  return BOSSES.filter(boss => boss.level <= playerLevel + 10);
}
