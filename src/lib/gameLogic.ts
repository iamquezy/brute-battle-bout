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
    stats: { ...CLASS_STATS[characterClass] },
  };
}

export function calculateDamage(attacker: Character, defender: Character): { damage: number; isCrit: boolean; isEvaded: boolean } {
  // Check evasion
  const evasionChance = defender.stats.evasion + (defender.stats.luck * 0.5);
  if (Math.random() * 100 < evasionChance) {
    return { damage: 0, isCrit: false, isEvaded: true };
  }
  
  const baseDamage = attacker.stats.attack;
  const defense = defender.stats.defense;
  const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
  
  let damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * randomFactor));
  
  // Check critical hit
  const critChance = attacker.stats.critChance + (attacker.stats.luck * 0.5);
  const isCrit = Math.random() * 100 < critChance;
  
  if (isCrit) {
    damage = Math.floor(damage * 2);
  }
  
  return { damage, isCrit, isEvaded: false };
}

export function checkLevelUp(character: Character): boolean {
  const expNeeded = character.level * 100;
  return character.experience >= expNeeded;
}

export function levelUpCharacter(character: Character, statChoice: StatType): Character {
  const newChar = { ...character };
  newChar.level += 1;
  newChar.experience = 0;
  
  switch (statChoice) {
    case 'attack':
      newChar.stats.attack += 3;
      newChar.stats.critChance += 1;
      break;
    case 'defense':
      newChar.stats.defense += 3;
      newChar.stats.evasion += 1;
      break;
    case 'speed':
      newChar.stats.speed += 3;
      newChar.stats.evasion += 2;
      break;
    case 'health':
      newChar.stats.maxHealth += 15;
      newChar.stats.health = newChar.stats.maxHealth;
      break;
  }
  
  return newChar;
}

export function determineFirstAttacker(char1: Character, char2: Character): 'player' | 'enemy' {
  if (char1.stats.speed > char2.stats.speed) return 'player';
  if (char2.stats.speed > char1.stats.speed) return 'enemy';
  return Math.random() > 0.5 ? 'player' : 'enemy';
}

export function createEnemyCharacter(playerLevel: number, opponentId?: string): Character {
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
  
  // Base balanced scaling (reduced for better player chances)
  const levelMultiplier = 1 + (playerLevel - 1) * 0.10;
  
  // Apply level and opponent-specific modifiers (enemies are weaker)
  enemy.stats.health = Math.floor(enemy.stats.health * levelMultiplier * 0.88 * statModifiers.healthMod);
  enemy.stats.maxHealth = enemy.stats.health;
  enemy.stats.attack = Math.floor(enemy.stats.attack * levelMultiplier * 0.85 * statModifiers.attackMod);
  enemy.stats.defense = Math.floor(enemy.stats.defense * levelMultiplier * 0.85 * statModifiers.defenseMod);
  enemy.stats.speed = Math.floor(enemy.stats.speed * levelMultiplier * 0.95 * statModifiers.speedMod);
  enemy.stats.evasion = Math.floor(enemy.stats.evasion * levelMultiplier * 0.90);
  enemy.stats.critChance = Math.floor(enemy.stats.critChance * levelMultiplier * 0.90);
  enemy.stats.luck = Math.floor(enemy.stats.luck * levelMultiplier * 0.90);
  
  return enemy;
}
