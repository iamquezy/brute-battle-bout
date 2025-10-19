import { Character, CharacterClass, StatType } from '@/types/game';

export const CLASS_STATS: Record<CharacterClass, Character['stats']> = {
  fighter: {
    health: 120,
    maxHealth: 120,
    attack: 15,
    defense: 12,
    speed: 8,
  },
  mage: {
    health: 80,
    maxHealth: 80,
    attack: 20,
    defense: 6,
    speed: 10,
  },
  archer: {
    health: 100,
    maxHealth: 100,
    attack: 18,
    defense: 8,
    speed: 14,
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

export function calculateDamage(attacker: Character, defender: Character): number {
  const baseDamage = attacker.stats.attack;
  const defense = defender.stats.defense;
  const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
  
  const damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * randomFactor));
  return damage;
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
      break;
    case 'defense':
      newChar.stats.defense += 3;
      break;
    case 'speed':
      newChar.stats.speed += 3;
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

export function createEnemyCharacter(playerLevel: number): Character {
  const classes: CharacterClass[] = ['fighter', 'mage', 'archer'];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  
  const enemy = createCharacter('Enemy Warrior', randomClass);
  enemy.level = playerLevel;
  
  // More balanced scaling - slightly weaker than player
  const levelMultiplier = 1 + (playerLevel - 1) * 0.12;
  enemy.stats.health = Math.floor(enemy.stats.health * levelMultiplier * 0.95);
  enemy.stats.maxHealth = enemy.stats.health;
  enemy.stats.attack = Math.floor(enemy.stats.attack * levelMultiplier * 0.90);
  enemy.stats.defense = Math.floor(enemy.stats.defense * levelMultiplier * 0.90);
  enemy.stats.speed = Math.floor(enemy.stats.speed * levelMultiplier);
  
  return enemy;
}
