import { Character, CharacterClass, StatType } from '@/types/game';
import { PRE_MADE_OPPONENTS } from '@/types/opponents';

export const CLASS_STATS: Record<CharacterClass, Character['stats']> = {
  fighter: {
    health: 120,
    maxHealth: 120,
    attack: 15,
    defense: 12,
    speed: 8,
    evasion: 5,
    critChance: 10,
    luck: 5,
  },
  mage: {
    health: 80,
    maxHealth: 80,
    attack: 20,
    defense: 6,
    speed: 10,
    evasion: 8,
    critChance: 15,
    luck: 7,
  },
  archer: {
    health: 100,
    maxHealth: 100,
    attack: 18,
    defense: 8,
    speed: 14,
    evasion: 12,
    critChance: 20,
    luck: 10,
  },
};

export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  fighter: 'High health and defense, moderate attack',
  mage: 'Devastating magic attacks, but fragile',
  archer: 'Balanced stats with exceptional speed',
};

export function createCharacter(name: string, characterClass: CharacterClass): Character {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    class: characterClass,
    level: 1,
    experience: 0,
    gold: 0,
    stats: { ...CLASS_STATS[characterClass] },
  };
}

export type CombatEvent = 
  | 'critical_failure'
  | 'pet_interference' 
  | 'arena_hazard'
  | 'second_wind'
  | 'divine_blessing'
  | null;

export function calculateDamage(
  attacker: Character, 
  defender: Character, 
  comboCount: number = 0
): { 
  damage: number; 
  isCrit: boolean; 
  isEvaded: boolean; 
  comboMultiplier: number;
  randomEvent: CombatEvent;
  eventDamage?: number;
} {
  let randomEvent: CombatEvent = null;
  let eventDamage = 0;
  
  // 5% chance for random combat event
  if (Math.random() < 0.05) {
    const events: CombatEvent[] = ['critical_failure', 'pet_interference', 'arena_hazard', 'second_wind', 'divine_blessing'];
    randomEvent = events[Math.floor(Math.random() * events.length)];
  }
  
  // Critical Failure - attacker misses completely
  if (randomEvent === 'critical_failure') {
    return { damage: 0, isCrit: false, isEvaded: false, comboMultiplier: 1, randomEvent };
  }
  
  // Check evasion
  const evasionChance = defender.stats.evasion + (defender.stats.luck * 0.5);
  if (Math.random() * 100 < evasionChance) {
    return { damage: 0, isCrit: false, isEvaded: true, comboMultiplier: 1, randomEvent: null };
  }
  
  const baseDamage = attacker.stats.attack;
  const defense = defender.stats.defense;
  const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
  
  let damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * randomFactor));
  
  // Check critical hit
  let critChance = attacker.stats.critChance + (attacker.stats.luck * 0.5);
  let isCrit = Math.random() * 100 < critChance;
  
  // Divine Blessing - guaranteed crit next hit
  if (randomEvent === 'divine_blessing') {
    isCrit = true;
  }
  
  if (isCrit) {
    damage = Math.floor(damage * 2);
  }
  
  // Pet Interference - bonus damage
  if (randomEvent === 'pet_interference') {
    const petBonus = Math.floor(attacker.stats.attack * 0.5);
    damage += petBonus;
  }
  
  // Apply combo multiplier (caps at 3x with 10+ combo)
  const comboMultiplier = Math.min(1 + (comboCount * 0.2), 3);
  damage = Math.floor(damage * comboMultiplier);
  
  // Arena Hazard - both fighters take damage (handled separately)
  if (randomEvent === 'arena_hazard') {
    eventDamage = 15 + Math.floor(Math.random() * 11); // 15-25 damage
  }
  
  return { damage, isCrit, isEvaded: false, comboMultiplier, randomEvent, eventDamage };
}

export function checkLevelUp(character: Character): boolean {
  const expNeeded = character.level * 100;
  return character.experience >= expNeeded;
}

export function levelUpCharacter(character: Character, statChoice: StatType): Character {
  const newChar = { ...character };
  newChar.level += 1;
  newChar.experience = 0;
  
  // Base stat increases for all stats (to match enemy scaling)
  newChar.stats.attack += 2;
  newChar.stats.defense += 2;
  newChar.stats.speed += 1;
  newChar.stats.maxHealth += 8;
  newChar.stats.evasion += 1;
  newChar.stats.critChance += 1;
  newChar.stats.luck += 1;
  
  // Additional bonus for chosen stat
  switch (statChoice) {
    case 'attack':
      newChar.stats.attack += 3;
      newChar.stats.critChance += 2;
      break;
    case 'defense':
      newChar.stats.defense += 3;
      newChar.stats.evasion += 2;
      break;
    case 'speed':
      newChar.stats.speed += 4;
      newChar.stats.evasion += 2;
      break;
    case 'health':
      newChar.stats.maxHealth += 12;
      break;
  }
  
  // Update current health to new max
  newChar.stats.health = newChar.stats.maxHealth;
  
  return newChar;
}

export function determineFirstAttacker(char1: Character, char2: Character): 'player' | 'enemy' {
  if (char1.stats.speed > char2.stats.speed) return 'player';
  if (char2.stats.speed > char1.stats.speed) return 'enemy';
  return Math.random() > 0.5 ? 'player' : 'enemy';
}

export type DifficultyTier = 'easy' | 'normal' | 'hard' | 'brutal';

export interface DifficultyModifier {
  name: string;
  multiplier: number;
  goldBonus: number;
  expBonus: number;
  description: string;
}

export const DIFFICULTY_TIERS: Record<DifficultyTier, DifficultyModifier> = {
  easy: { name: 'Easy', multiplier: 0.8, goldBonus: 1.0, expBonus: 1.0, description: 'Weaker enemies, standard rewards' },
  normal: { name: 'Normal', multiplier: 1.0, goldBonus: 1.2, expBonus: 1.2, description: 'Balanced challenge, bonus rewards' },
  hard: { name: 'Hard', multiplier: 1.2, goldBonus: 1.5, expBonus: 1.5, description: 'Tough fight, great rewards' },
  brutal: { name: 'Brutal', multiplier: 1.5, goldBonus: 2.0, expBonus: 2.0, description: 'Extreme challenge, massive rewards' },
};

export function createEnemyCharacter(playerLevel: number, opponentId?: string, difficulty: DifficultyTier = 'normal'): Character {
  const classes: CharacterClass[] = ['fighter', 'mage', 'archer'];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  
  let enemy = createCharacter('Enemy Warrior', randomClass);
  let statModifiers = {
    healthMod: 1,
    attackMod: 1,
    defenseMod: 1,
    speedMod: 1,
  };
  
  // If a specific opponent is chosen, use their stats
  if (opponentId) {
    const opponent = PRE_MADE_OPPONENTS.find((o) => o.id === opponentId);
    if (opponent) {
      enemy = createCharacter(opponent.title, opponent.class); // Use title instead of name
      statModifiers = opponent.statModifiers;
    }
  }
  
  enemy.level = playerLevel;
  
  // NEW: Improved scaling for real challenge (95-105% of player power)
  const baseMultiplier = 0.95 + Math.random() * 0.10; // Random 95-105%
  const levelMultiplier = 1 + (playerLevel - 1) * 0.12; // Increased from 0.10
  const difficultyMod = DIFFICULTY_TIERS[difficulty].multiplier;
  
  // Apply scaling (enemies are now competitive)
  enemy.stats.health = Math.floor(enemy.stats.health * levelMultiplier * baseMultiplier * difficultyMod * statModifiers.healthMod);
  enemy.stats.maxHealth = enemy.stats.health;
  enemy.stats.attack = Math.floor(enemy.stats.attack * levelMultiplier * baseMultiplier * difficultyMod * statModifiers.attackMod);
  enemy.stats.defense = Math.floor(enemy.stats.defense * levelMultiplier * baseMultiplier * difficultyMod * statModifiers.defenseMod);
  enemy.stats.speed = Math.floor(enemy.stats.speed * levelMultiplier * baseMultiplier * difficultyMod * statModifiers.speedMod);
  enemy.stats.evasion = Math.floor(enemy.stats.evasion * levelMultiplier * baseMultiplier * difficultyMod);
  enemy.stats.critChance = Math.floor(enemy.stats.critChance * levelMultiplier * baseMultiplier * difficultyMod);
  enemy.stats.luck = Math.floor(enemy.stats.luck * levelMultiplier * baseMultiplier * difficultyMod);
  
  return enemy;
}
