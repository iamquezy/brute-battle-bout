import { CharacterClass } from './game';

export interface PreMadeOpponent {
  id: string;
  name: string;
  class: CharacterClass;
  title: string;
  description: string;
  statModifiers: {
    healthMod: number;
    attackMod: number;
    defenseMod: number;
    speedMod: number;
  };
}

export const PRE_MADE_OPPONENTS: PreMadeOpponent[] = [
  {
    id: 'brutus',
    name: 'Brutus the Crusher',
    class: 'fighter',
    title: 'The Mountain',
    description: 'Slow but incredibly powerful',
    statModifiers: {
      healthMod: 1.15,
      attackMod: 1.10,
      defenseMod: 1.05,
      speedMod: 0.85,
    },
  },
  {
    id: 'vex',
    name: 'Vex Shadowblade',
    class: 'archer',
    title: 'The Swift Death',
    description: 'Lightning fast with moderate damage',
    statModifiers: {
      healthMod: 0.90,
      attackMod: 0.95,
      defenseMod: 0.85,
      speedMod: 1.20,
    },
  },
  {
    id: 'malakai',
    name: 'Malakai the Cursed',
    class: 'mage',
    title: 'The Dark Sorcerer',
    description: 'Balanced and unpredictable',
    statModifiers: {
      healthMod: 1.00,
      attackMod: 1.05,
      defenseMod: 0.95,
      speedMod: 1.00,
    },
  },
];
