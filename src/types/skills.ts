export type SkillCategory = 'passive' | 'stat_booster' | 'super' | 'talent';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effect?: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    evasion?: number;
    critChance?: number;
    luck?: number;
    damageMultiplier?: number;
    damageReduction?: number;
  };
  usesPerFight?: number; // For supers
}

export interface PlayerSkills {
  acquired: string[]; // Array of skill IDs
  active: string[]; // Currently active skills (for talents that can be toggled)
}
