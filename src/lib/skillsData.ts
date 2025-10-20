import { Skill } from '@/types/skills';

export const ALL_SKILLS: Skill[] = [
  // Passive Skills (14)
  {
    id: 'weapons_master',
    name: 'Weapons Master',
    category: 'passive',
    description: 'Increased damage with all weapons',
    rarity: 'uncommon',
    effect: { attack: 3, critChance: 2 },
  },
  {
    id: 'martial_arts',
    name: 'Martial Arts',
    category: 'passive',
    description: 'Enhanced combat techniques',
    rarity: 'uncommon',
    effect: { attack: 2, speed: 2 },
  },
  {
    id: 'sixth_sense',
    name: '6th Sense',
    category: 'passive',
    description: 'Heightened awareness in battle',
    rarity: 'rare',
    effect: { evasion: 5, luck: 2 },
  },
  {
    id: 'hostility',
    name: 'Hostility',
    category: 'passive',
    description: 'Aggressive fighting style',
    rarity: 'common',
    effect: { attack: 4 },
  },
  {
    id: 'fists_of_fury',
    name: 'Fists of Fury',
    category: 'passive',
    description: 'Devastating unarmed strikes',
    rarity: 'uncommon',
    effect: { attack: 5, speed: 1 },
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'passive',
    description: 'Expert shield defense',
    rarity: 'common',
    effect: { defense: 5 },
  },
  {
    id: 'armor',
    name: 'Armor',
    category: 'passive',
    description: 'Enhanced armor effectiveness',
    rarity: 'common',
    effect: { defense: 4 },
  },
  {
    id: 'toughened_skin',
    name: 'Toughened Skin',
    category: 'passive',
    description: 'Natural damage resistance',
    rarity: 'uncommon',
    effect: { defense: 3, health: 10 },
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    category: 'passive',
    description: 'Exceptional dodge ability',
    rarity: 'rare',
    effect: { evasion: 8 },
  },
  {
    id: 'counter_attack',
    name: 'Counter Attack',
    category: 'passive',
    description: 'Strike back when hit',
    rarity: 'rare',
    effect: { attack: 3, speed: 3 },
  },
  {
    id: 'first_strike',
    name: 'First Strike',
    category: 'passive',
    description: 'Always attack first',
    rarity: 'epic',
    effect: { speed: 10 },
  },
  {
    id: 'iron_head',
    name: 'Iron Head',
    category: 'passive',
    description: 'Unbreakable will',
    rarity: 'uncommon',
    effect: { defense: 2, health: 15 },
  },
  {
    id: 'determination',
    name: 'Determination',
    category: 'passive',
    description: 'Never give up',
    rarity: 'rare',
    effect: { health: 20, defense: 2 },
  },
  {
    id: 'resistant',
    name: 'Resistant',
    category: 'passive',
    description: 'Shrug off damage',
    rarity: 'uncommon',
    effect: { defense: 3, health: 10 },
  },

  // Stat Boosters (6)
  {
    id: 'herculean_strength',
    name: 'Herculean Strength',
    category: 'stat_booster',
    description: 'Massive strength increase',
    rarity: 'epic',
    effect: { attack: 8 },
  },
  {
    id: 'feline_agility',
    name: 'Feline Agility',
    category: 'stat_booster',
    description: 'Cat-like reflexes',
    rarity: 'epic',
    effect: { evasion: 10, speed: 5 },
  },
  {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    category: 'stat_booster',
    description: 'Incredible speed',
    rarity: 'epic',
    effect: { speed: 8 },
  },
  {
    id: 'vitality',
    name: 'Vitality',
    category: 'stat_booster',
    description: 'Enhanced life force',
    rarity: 'epic',
    effect: { health: 30 },
  },
  {
    id: 'immortality',
    name: 'Immortality',
    category: 'stat_booster',
    description: 'Greatly increased endurance',
    rarity: 'legendary',
    effect: { health: 50, defense: 5 },
  },
  {
    id: 'reconnaissance',
    name: 'Reconnaissance',
    category: 'stat_booster',
    description: 'Scout training',
    rarity: 'rare',
    effect: { speed: 6, evasion: 4 },
  },

  // Supers (5) - now permanent bonuses
  {
    id: 'fierce_brute',
    name: 'Fierce Brute',
    category: 'super',
    description: 'Devastating power',
    rarity: 'rare',
    effect: { attack: 10 },
  },
  {
    id: 'hammer',
    name: 'Hammer',
    category: 'super',
    description: 'Crushing strength',
    rarity: 'rare',
    effect: { attack: 8, defense: 3 },
  },
  {
    id: 'flash_flood',
    name: 'Flash Flood',
    category: 'super',
    description: 'Overwhelming power',
    rarity: 'epic',
    effect: { attack: 6, speed: 6 },
  },
  {
    id: 'hypnosis',
    name: 'Hypnosis',
    category: 'super',
    description: 'Confounding presence',
    rarity: 'epic',
    effect: { evasion: 10, luck: 3 },
  },
  {
    id: 'tragic_potion',
    name: 'Tragic Potion',
    category: 'super',
    description: 'Mysterious enhancement',
    rarity: 'rare',
    effect: { health: 25, attack: 5 },
  },

  // Talents (3)
  {
    id: 'regeneration',
    name: 'Regeneration',
    category: 'talent',
    description: 'Slowly heal during battle',
    rarity: 'legendary',
    effect: { health: 5 },
  },
  {
    id: 'chef',
    name: 'Chef',
    category: 'talent',
    description: 'Better recovery between fights',
    rarity: 'uncommon',
    effect: { health: 10 },
  },
  {
    id: 'spy',
    name: 'Spy',
    category: 'talent',
    description: 'Know enemy weaknesses',
    rarity: 'rare',
    effect: { luck: 5, evasion: 3 },
  },
];

export function getSkillsByCategory(category: Skill['category']): Skill[] {
  return ALL_SKILLS.filter(skill => skill.category === category);
}

export function getSkillById(id: string): Skill | undefined {
  return ALL_SKILLS.find(skill => skill.id === id);
}

export function getRandomSkill(exclude: string[] = []): Skill {
  const availableSkills = ALL_SKILLS.filter(skill => !exclude.includes(skill.id));
  
  // Weight by rarity (lower rarity = higher chance)
  const weightedSkills: Skill[] = [];
  availableSkills.forEach(skill => {
    const weight = 
      skill.rarity === 'common' ? 10 :
      skill.rarity === 'uncommon' ? 6 :
      skill.rarity === 'rare' ? 3 :
      skill.rarity === 'epic' ? 1 :
      0.5; // legendary
    
    for (let i = 0; i < weight; i++) {
      weightedSkills.push(skill);
    }
  });
  
  return weightedSkills[Math.floor(Math.random() * weightedSkills.length)];
}
