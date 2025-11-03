import { CharacterClass } from '@/types/game';

export type ClassTier = 1 | 2 | 3 | 4;

export interface ClassEvolutionPath {
  tier: ClassTier;
  baseClass: CharacterClass;
  subclass: string;
  name: string;
  description: string;
  statBonuses: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    critChance?: number;
    evasion?: number;
  };
  specialAbility?: string;
}

export interface EvolutionRequirements {
  level: number;
  pvpWins: number;
  bossDefeats: number;
  gold: number;
  specialItem?: string;
  guildRank?: number;
}

// Tier 2 (Level 20): First Evolution
export const TIER_2_EVOLUTIONS: ClassEvolutionPath[] = [
  // Fighter paths
  {
    tier: 2,
    baseClass: 'fighter',
    subclass: 'berserker',
    name: 'Berserker',
    description: 'Aggressive warrior focused on devastating attacks and life-steal',
    statBonuses: { attack: 15, critChance: 10, health: 30 },
    specialAbility: 'Blood Rage: Deal 50% more damage when below 30% HP'
  },
  {
    tier: 2,
    baseClass: 'fighter',
    subclass: 'guardian',
    name: 'Guardian',
    description: 'Defensive tank with massive health and damage reduction',
    statBonuses: { defense: 20, health: 80, evasion: 5 },
    specialAbility: 'Iron Wall: Reduce all incoming damage by 20%'
  },
  
  // Mage paths
  {
    tier: 2,
    baseClass: 'mage',
    subclass: 'sorcerer',
    name: 'Sorcerer',
    description: 'Master of raw magical power and devastating spells',
    statBonuses: { attack: 20, critChance: 15, speed: 5 },
    specialAbility: 'Arcane Surge: 30% chance to cast spell twice'
  },
  {
    tier: 2,
    baseClass: 'mage',
    subclass: 'cleric',
    name: 'Cleric',
    description: 'Holy warrior with healing and support abilities',
    statBonuses: { defense: 10, health: 50, attack: 10 },
    specialAbility: 'Divine Heal: Restore 15% HP every 5 turns'
  },
  
  // Archer paths
  {
    tier: 2,
    baseClass: 'archer',
    subclass: 'hunter',
    name: 'Hunter',
    description: 'Precision marksman with enhanced critical damage',
    statBonuses: { attack: 15, critChance: 25, speed: 10 },
    specialAbility: 'Headshot: Critical hits deal 3x damage instead of 2x'
  },
  {
    tier: 2,
    baseClass: 'archer',
    subclass: 'ranger',
    name: 'Ranger',
    description: 'Swift scout with superior evasion and mobility',
    statBonuses: { evasion: 15, speed: 20, defense: 8 },
    specialAbility: 'Shadow Step: 25% chance to attack twice per turn'
  },
];

// Tier 3 (Level 40): Elite Evolution
export const TIER_3_EVOLUTIONS: ClassEvolutionPath[] = [
  // Berserker → Elite
  {
    tier: 3,
    baseClass: 'fighter',
    subclass: 'warlord',
    name: 'Warlord',
    description: 'Supreme warrior commanding the battlefield with raw power',
    statBonuses: { attack: 30, health: 100, critChance: 15 },
    specialAbility: 'Warlord\'s Fury: Every 3rd attack deals 200% damage'
  },
  {
    tier: 3,
    baseClass: 'fighter',
    subclass: 'blademaster',
    name: 'Blademaster',
    description: 'Perfect swordsman with unmatched technique',
    statBonuses: { attack: 35, speed: 15, critChance: 20 },
    specialAbility: 'Blade Dance: Consecutive hits increase damage by 10% (stacks 5x)'
  },
  
  // Guardian → Elite
  {
    tier: 3,
    baseClass: 'fighter',
    subclass: 'paladin',
    name: 'Paladin',
    description: 'Holy defender with divine protection',
    statBonuses: { defense: 35, health: 150, attack: 15 },
    specialAbility: 'Divine Shield: Absorb fatal blow once per battle'
  },
  {
    tier: 3,
    baseClass: 'fighter',
    subclass: 'sentinel',
    name: 'Sentinel',
    description: 'Unbreakable fortress with massive durability',
    statBonuses: { defense: 40, health: 200, evasion: 10 },
    specialAbility: 'Fortress: Take 30% reduced damage from all sources'
  },
  
  // Sorcerer → Elite
  {
    tier: 3,
    baseClass: 'mage',
    subclass: 'archmage',
    name: 'Archmage',
    description: 'Master of all arcane arts with overwhelming power',
    statBonuses: { attack: 40, critChance: 25, health: 50 },
    specialAbility: 'Arcane Mastery: All spells ignore 50% of defense'
  },
  {
    tier: 3,
    baseClass: 'mage',
    subclass: 'battlemage',
    name: 'Battlemage',
    description: 'Warrior-mage blending magic and combat prowess',
    statBonuses: { attack: 30, defense: 20, health: 80 },
    specialAbility: 'Spell Blade: Physical attacks deal bonus magic damage'
  },
  
  // Cleric → Elite
  {
    tier: 3,
    baseClass: 'mage',
    subclass: 'high_priest',
    name: 'High Priest',
    description: 'Divine servant with powerful healing and support',
    statBonuses: { health: 120, defense: 25, attack: 20 },
    specialAbility: 'Divine Grace: Heal 25% HP every 4 turns'
  },
  {
    tier: 3,
    baseClass: 'mage',
    subclass: 'war_priest',
    name: 'War Priest',
    description: 'Holy warrior channeling divine wrath',
    statBonuses: { attack: 25, defense: 20, health: 100, critChance: 15 },
    specialAbility: 'Smite: Critical hits restore 20% HP'
  },
  
  // Hunter → Elite
  {
    tier: 3,
    baseClass: 'archer',
    subclass: 'sniper',
    name: 'Sniper',
    description: 'Perfect marksman with deadly precision',
    statBonuses: { attack: 30, critChance: 40, speed: 15 },
    specialAbility: 'One Shot: First attack always critical, deals 4x damage'
  },
  {
    tier: 3,
    baseClass: 'archer',
    subclass: 'assassin',
    name: 'Assassin',
    description: 'Silent killer striking from the shadows',
    statBonuses: { attack: 35, evasion: 20, critChance: 30 },
    specialAbility: 'Backstab: 40% chance to instantly kill enemies below 25% HP'
  },
  
  // Ranger → Elite
  {
    tier: 3,
    baseClass: 'archer',
    subclass: 'pathfinder',
    name: 'Pathfinder',
    description: 'Master scout with unmatched mobility',
    statBonuses: { speed: 35, evasion: 25, attack: 20 },
    specialAbility: 'Phantom Step: Attack 3 times every 5th turn'
  },
  {
    tier: 3,
    baseClass: 'archer',
    subclass: 'scout',
    name: 'Scout',
    description: 'Elite ranger with supreme awareness',
    statBonuses: { evasion: 30, speed: 30, defense: 15 },
    specialAbility: 'Eagle Eye: Never miss, counter attack on evade'
  },
];

// Tier 4 (Level 76): Epic Evolution (Guild-based)
export const TIER_4_EVOLUTIONS: ClassEvolutionPath[] = [
  {
    tier: 4,
    baseClass: 'fighter',
    subclass: 'conqueror',
    name: 'Conqueror',
    description: 'Legendary warlord who commands armies',
    statBonuses: { attack: 50, health: 200, critChance: 25, defense: 30 },
    specialAbility: 'War God: +10% ATK to all guild members'
  },
  {
    tier: 4,
    baseClass: 'mage',
    subclass: 'sage',
    name: 'Sage',
    description: 'Enlightened master of all knowledge',
    statBonuses: { attack: 60, critChance: 35, health: 100, speed: 20 },
    specialAbility: 'Wisdom: +10% XP to all guild members'
  },
  {
    tier: 4,
    baseClass: 'archer',
    subclass: 'deadeye',
    name: 'Deadeye',
    description: 'Perfect shooter who never misses',
    statBonuses: { attack: 45, critChance: 60, speed: 30, evasion: 25 },
    specialAbility: 'Perfect Aim: +10% Crit to all guild members'
  },
];

export const EVOLUTION_REQUIREMENTS: Record<ClassTier, EvolutionRequirements> = {
  1: { level: 1, pvpWins: 0, bossDefeats: 0, gold: 0 }, // Base class
  2: { level: 20, pvpWins: 10, bossDefeats: 5, gold: 5000 },
  3: { level: 40, pvpWins: 30, bossDefeats: 15, gold: 20000 },
  4: { level: 76, pvpWins: 50, bossDefeats: 30, gold: 100000, guildRank: 10 },
};

export function getAvailableEvolutions(
  baseClass: CharacterClass,
  currentTier: ClassTier,
  currentSubclass?: string
): ClassEvolutionPath[] {
  const nextTier = (currentTier + 1) as ClassTier;
  
  if (nextTier === 2) {
    return TIER_2_EVOLUTIONS.filter(e => e.baseClass === baseClass);
  }
  
  if (nextTier === 3) {
    // Filter by current subclass
    return TIER_3_EVOLUTIONS.filter(e => 
      e.baseClass === baseClass && 
      e.subclass.startsWith(currentSubclass?.split('_')[0] || '')
    );
  }
  
  if (nextTier === 4) {
    return TIER_4_EVOLUTIONS.filter(e => e.baseClass === baseClass);
  }
  
  return [];
}

export function canEvolve(
  level: number,
  currentTier: ClassTier,
  pvpWins: number,
  bossDefeats: number,
  gold: number,
  guildRank?: number
): { canEvolve: boolean; missingRequirements: string[] } {
  const nextTier = (currentTier + 1) as ClassTier;
  if (nextTier > 4) return { canEvolve: false, missingRequirements: ['Max tier reached'] };
  
  const requirements = EVOLUTION_REQUIREMENTS[nextTier];
  const missing: string[] = [];
  
  if (level < requirements.level) missing.push(`Level ${requirements.level}`);
  if (pvpWins < requirements.pvpWins) missing.push(`${requirements.pvpWins} PvP wins`);
  if (bossDefeats < requirements.bossDefeats) missing.push(`${requirements.bossDefeats} boss defeats`);
  if (gold < requirements.gold) missing.push(`${requirements.gold} gold`);
  if (requirements.guildRank && (!guildRank || guildRank < requirements.guildRank)) {
    missing.push(`Guild rank ${requirements.guildRank}`);
  }
  
  return { canEvolve: missing.length === 0, missingRequirements: missing };
}
