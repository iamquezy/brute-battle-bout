import { Pet, PetRarity } from '@/types/pets';

export const PET_LIBRARY: Omit<Pet, 'level' | 'experience'>[] = [
  // Common Pets
  {
    id: 'wolf',
    name: 'Wolf',
    rarity: 'common',
    description: 'A loyal companion that enhances your attacks',
    emoji: '🐺',
    bonuses: { attack: 5 },
  },
  {
    id: 'falcon',
    name: 'Falcon',
    rarity: 'common',
    description: 'Swift bird that increases your speed',
    emoji: '🦅',
    bonuses: { speed: 5 },
  },
  {
    id: 'rabbit',
    name: 'Lucky Rabbit',
    rarity: 'common',
    description: 'Brings good fortune to your battles',
    emoji: '🐰',
    bonuses: { luck: 10 },
  },
  
  // Rare Pets
  {
    id: 'bear',
    name: 'Bear',
    rarity: 'rare',
    description: 'Powerful beast that boosts defense and health',
    emoji: '🐻',
    bonuses: { defense: 10, health: 20 },
  },
  {
    id: 'owl',
    name: 'Wise Owl',
    rarity: 'rare',
    description: 'Mystical bird that increases experience gain',
    emoji: '🦉',
    bonuses: { expMultiplier: 1.2 },
  },
  {
    id: 'fox',
    name: 'Cunning Fox',
    rarity: 'rare',
    description: 'Clever companion that improves evasion',
    emoji: '🦊',
    bonuses: { evasion: 8, speed: 5 },
  },
  
  // Epic Pets
  {
    id: 'dragon',
    name: 'Dragon Hatchling',
    rarity: 'epic',
    description: 'Young dragon that enhances all your stats',
    emoji: '🐉',
    bonuses: { 
      attack: 8, 
      defense: 8, 
      speed: 8, 
      health: 15 
    },
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    rarity: 'epic',
    description: 'Magical creature that increases luck and critical hits',
    emoji: '🦄',
    bonuses: { luck: 15, critChance: 10 },
  },
  {
    id: 'tiger',
    name: 'Shadow Tiger',
    rarity: 'epic',
    description: 'Fierce predator that boosts attack and critical chance',
    emoji: '🐅',
    bonuses: { attack: 12, critChance: 8 },
  },
  
  // Legendary Pets
  {
    id: 'phoenix',
    name: 'Phoenix',
    rarity: 'legendary',
    description: 'Immortal bird that revives you once per battle at 20% HP',
    emoji: '🔥',
    bonuses: { 
      critChance: 10, 
      health: 25,
      reviveOnce: true 
    },
  },
  {
    id: 'basilisk',
    name: 'Basilisk',
    rarity: 'legendary',
    description: 'Legendary serpent that greatly enhances attack and evasion',
    emoji: '🐍',
    bonuses: { attack: 15, evasion: 8, speed: 10 },
  },
];

export const getPetByRarity = (rarity: PetRarity): Pet => {
  const petsOfRarity = PET_LIBRARY.filter(p => p.rarity === rarity);
  const randomPet = petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)];
  
  return {
    ...randomPet,
    id: `${randomPet.id}_${Date.now()}`, // unique instance id
    level: 1,
    experience: 0,
  };
};

export const rollPetDrop = (): Pet | null => {
  const roll = Math.random();
  
  if (roll < 0.001) return getPetByRarity('legendary');
  if (roll < 0.006) return getPetByRarity('epic');
  if (roll < 0.026) return getPetByRarity('rare');
  if (roll < 0.076) return getPetByRarity('common');
  
  return null;
};
