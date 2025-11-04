import { Character } from '@/types/game';
import { toast } from 'sonner';

export interface CombatSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  effect: (user: Character, target: Character) => SkillResult;
}

export interface SkillResult {
  damage: number;
  healing?: number;
  buff?: string;
  message: string;
}

// Class-specific skills
const FIGHTER_SKILLS: CombatSkill[] = [
  {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'Deal 2.5x damage',
    cooldown: 3,
    effect: (user, target) => ({
      damage: Math.floor(user.stats.attack * 2.5),
      message: `${user.name} unleashes a devastating Power Strike!`
    })
  },
  {
    id: 'berserker_rage',
    name: 'Berserker Rage',
    description: 'Deal 2x damage and heal 20% of damage dealt',
    cooldown: 4,
    effect: (user, target) => {
      const damage = Math.floor(user.stats.attack * 2);
      const healing = Math.floor(damage * 0.2);
      return {
        damage,
        healing,
        message: `${user.name} enters a berserker rage!`
      };
    }
  }
];

const MAGE_SKILLS: CombatSkill[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Deal 3x magic damage',
    cooldown: 3,
    effect: (user, target) => ({
      damage: Math.floor(user.stats.attack * 3),
      message: `${user.name} hurls a massive fireball!`
    })
  },
  {
    id: 'mana_drain',
    name: 'Mana Drain',
    description: 'Deal damage and heal for 30% of damage',
    cooldown: 4,
    effect: (user, target) => {
      const damage = Math.floor(user.stats.attack * 1.8);
      const healing = Math.floor(damage * 0.3);
      return {
        damage,
        healing,
        message: `${user.name} drains the life force!`
      };
    }
  }
];

const ARCHER_SKILLS: CombatSkill[] = [
  {
    id: 'multi_shot',
    name: 'Multi-Shot',
    description: 'Fire 3 arrows for 1.5x damage each',
    cooldown: 3,
    effect: (user, target) => ({
      damage: Math.floor(user.stats.attack * 1.5 * 3),
      message: `${user.name} fires a volley of arrows!`
    })
  },
  {
    id: 'precision_shot',
    name: 'Precision Shot',
    description: 'Guaranteed critical hit',
    cooldown: 4,
    effect: (user, target) => ({
      damage: Math.floor(user.stats.attack * 3.5),
      message: `${user.name} takes careful aim for a precision shot!`
    })
  }
];

export const getClassSkills = (characterClass: Character['class']): CombatSkill[] => {
  switch (characterClass) {
    case 'fighter':
      return FIGHTER_SKILLS;
    case 'mage':
      return MAGE_SKILLS;
    case 'archer':
      return ARCHER_SKILLS;
  }
};

export const useCombatSkills = () => {
  const useSkill = (
    skill: CombatSkill,
    user: Character,
    target: Character,
    skillCooldowns: Record<string, number>
  ): { result: SkillResult | null; newCooldowns: Record<string, number> } => {
    // Check cooldown
    if (skillCooldowns[skill.id] && skillCooldowns[skill.id] > 0) {
      toast.error(`${skill.name} is on cooldown!`);
      return { result: null, newCooldowns: skillCooldowns };
    }

    // Execute skill
    const result = skill.effect(user, target);
    
    // Set cooldown
    const newCooldowns = {
      ...skillCooldowns,
      [skill.id]: skill.cooldown
    };

    toast.success(`${skill.name} used!`);
    return { result, newCooldowns };
  };

  const tickCooldowns = (cooldowns: Record<string, number>): Record<string, number> => {
    const newCooldowns: Record<string, number> = {};
    for (const [skillId, turns] of Object.entries(cooldowns)) {
      if (turns > 0) {
        newCooldowns[skillId] = turns - 1;
      }
    }
    return newCooldowns;
  };

  return { useSkill, tickCooldowns };
};
