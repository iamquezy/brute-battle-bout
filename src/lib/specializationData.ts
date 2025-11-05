import { Specialization } from '@/types/specialization';

export const SPECIALIZATIONS: Record<string, Specialization> = {
  // Fighter Specializations
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    description: 'Embrace rage and fury. Massive damage output at the cost of defense.',
    class: 'fighter',
    icon: '⚔️',
    requiredLevel: 10,
    bonuses: {
      attack: 15,
      critChance: 10,
      critDamage: 25,
      defense: -5,
    },
    uniqueAbility: {
      name: 'Blood Rage',
      description: 'Deal 200% damage but take 50% more damage for 3 turns',
      cooldown: 5,
    },
  },
  guardian: {
    id: 'guardian',
    name: 'Guardian',
    description: 'The ultimate tank. Unbreakable defense and high survivability.',
    class: 'fighter',
    icon: '🛡️',
    requiredLevel: 10,
    bonuses: {
      defense: 20,
      health: 100,
      evasion: 5,
      attack: -5,
    },
    uniqueAbility: {
      name: 'Iron Fortress',
      description: 'Block all damage for 2 turns and counter-attack',
      cooldown: 6,
    },
  },
  duelist: {
    id: 'duelist',
    name: 'Duelist',
    description: 'Master of precision strikes. High critical hit chance and speed.',
    class: 'fighter',
    icon: '🗡️',
    requiredLevel: 10,
    bonuses: {
      speed: 15,
      critChance: 15,
      evasion: 8,
      attack: 8,
    },
    uniqueAbility: {
      name: 'Precision Strike',
      description: 'Guaranteed critical hit with 300% damage',
      cooldown: 4,
    },
  },

  // Mage Specializations
  elementalist: {
    id: 'elementalist',
    name: 'Elementalist',
    description: 'Harness the power of all elements for devastating magical attacks.',
    class: 'mage',
    icon: '🔥',
    requiredLevel: 10,
    bonuses: {
      attack: 12,
      critChance: 8,
      luck: 10,
    },
    uniqueAbility: {
      name: 'Elemental Fury',
      description: 'Cast 3 random elemental spells in one turn',
      cooldown: 5,
    },
  },
  necromancer: {
    id: 'necromancer',
    name: 'Necromancer',
    description: 'Control life and death. Drain enemy health to sustain yourself.',
    class: 'mage',
    icon: '💀',
    requiredLevel: 10,
    bonuses: {
      attack: 10,
      health: 50,
      defense: 5,
      evasion: -3,
    },
    uniqueAbility: {
      name: 'Life Drain',
      description: 'Deal damage and heal for 100% of damage dealt',
      cooldown: 4,
    },
  },
  battlemage: {
    id: 'battlemage',
    name: 'Battlemage',
    description: 'Combine magic and physical prowess for balanced combat.',
    class: 'mage',
    icon: '⚡',
    requiredLevel: 10,
    bonuses: {
      attack: 8,
      defense: 8,
      speed: 8,
      health: 30,
    },
    uniqueAbility: {
      name: 'Arcane Blade',
      description: 'Physical attack infused with magic dealing hybrid damage',
      cooldown: 3,
    },
  },

  // Archer Specializations
  sniper: {
    id: 'sniper',
    name: 'Sniper',
    description: 'Perfect accuracy from range. Devastating single-target damage.',
    class: 'archer',
    icon: '🎯',
    requiredLevel: 10,
    bonuses: {
      attack: 10,
      critChance: 20,
      critDamage: 30,
      speed: -5,
    },
    uniqueAbility: {
      name: 'Headshot',
      description: 'Ignore all defense and deal 400% damage',
      cooldown: 6,
    },
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    description: 'Swift and versatile. High mobility and sustained damage.',
    class: 'archer',
    icon: '🏹',
    requiredLevel: 10,
    bonuses: {
      speed: 20,
      evasion: 12,
      attack: 8,
      luck: 5,
    },
    uniqueAbility: {
      name: 'Rapid Fire',
      description: 'Attack 5 times with 60% damage each',
      cooldown: 4,
    },
  },
  assassin: {
    id: 'assassin',
    name: 'Assassin',
    description: 'Strike from the shadows. Extreme critical damage and evasion.',
    class: 'archer',
    icon: '🗡️',
    requiredLevel: 10,
    bonuses: {
      critChance: 15,
      critDamage: 40,
      evasion: 15,
      health: -20,
    },
    uniqueAbility: {
      name: 'Backstab',
      description: 'Guaranteed critical with 500% damage if at full health',
      cooldown: 7,
    },
  },
};

export const getSpecializationsForClass = (characterClass: string) => {
  return Object.values(SPECIALIZATIONS).filter(spec => spec.class === characterClass);
};