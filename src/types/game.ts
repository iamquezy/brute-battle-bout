export type CharacterClass = 'fighter' | 'mage' | 'archer';

export type StatType = 'attack' | 'defense' | 'speed' | 'health';

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  gold: number;
  stats: {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
    evasion: number;
    critChance: number;
    luck: number;
  };
}

export interface CombatLog {
  id: string;
  message: string;
  type: 'attack' | 'damage' | 'victory' | 'defeat';
  timestamp: number;
}

export interface LevelUpChoice {
  stat: StatType;
  label: string;
  description: string;
  increase: number;
}
