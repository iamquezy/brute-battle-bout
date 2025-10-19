import { CharacterClass } from './game';

export interface PreMadeFighter {
  id: string;
  name: string;
  class: CharacterClass;
  title: string;
  description: string;
  backstory: string;
}

export const PRE_MADE_FIGHTERS: PreMadeFighter[] = [
  {
    id: 'ragnar',
    name: 'Ragnar Ironhide',
    class: 'fighter',
    title: 'The Steel Wall',
    description: 'A veteran warrior with unmatched endurance',
    backstory: 'Forged in countless battles, Ragnar\'s shield has never been broken. His defensive prowess makes him nearly impossible to defeat in prolonged combat.',
  },
  {
    id: 'lyra',
    name: 'Lyra Stormweaver',
    class: 'mage',
    title: 'The Arcane Tempest',
    description: 'Master of devastating elemental magic',
    backstory: 'Born with raw magical talent, Lyra channels the fury of storms. Her spells can obliterate foes before they land a single blow.',
  },
  {
    id: 'kael',
    name: 'Kael Swiftshadow',
    class: 'archer',
    title: 'The Silent Hunter',
    description: 'Lightning-fast precision striker',
    backstory: 'Trained in the ancient art of swift combat, Kael strikes with deadly accuracy. His speed allows him to control the flow of battle.',
  },
];
