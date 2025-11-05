import { CharacterClass } from './game';

export type SpecializationId = 
  // Fighter specializations
  | 'berserker' | 'guardian' | 'duelist'
  // Mage specializations
  | 'elementalist' | 'necromancer' | 'battlemage'
  // Archer specializations
  | 'sniper' | 'ranger' | 'assassin';

export interface Specialization {
  id: SpecializationId;
  name: string;
  description: string;
  class: CharacterClass;
  icon: string;
  requiredLevel: number;
  bonuses: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    evasion?: number;
    critChance?: number;
    critDamage?: number;
    luck?: number;
  };
  uniqueAbility: {
    name: string;
    description: string;
    cooldown: number;
  };
}

export interface SpecializationProgress {
  specializationId: SpecializationId | null;
  unlockedAt: number;
  level: number;
  experience: number;
}