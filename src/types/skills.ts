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
}

export interface PlayerSkills {
  acquired: string[];
}
