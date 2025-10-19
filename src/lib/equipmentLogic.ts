import { Equipment, EquipmentType, Rarity, RARITY_CHANCES, RARITY_STAT_MULTIPLIERS } from '@/types/equipment';
import { CharacterClass } from '@/types/game';

const WEAPON_NAMES: Record<CharacterClass, string[]> = {
  fighter: ['Iron Sword', 'Steel Blade', 'Battle Axe', 'War Hammer', 'Greatsword'],
  mage: ['Wooden Staff', 'Crystal Wand', 'Arcane Rod', 'Mystic Tome', 'Elder Staff'],
  archer: ['Short Bow', 'Longbow', 'Crossbow', 'Composite Bow', 'Elven Bow'],
};

const ARMOR_NAMES = ['Leather Vest', 'Chain Mail', 'Plate Armor', 'Dragon Scale', 'Enchanted Robe'];
const ACCESSORY_NAMES = ['Ring of Power', 'Lucky Charm', 'Amulet', 'Blessed Pendant', 'Ancient Talisman'];

export function generateRandomRarity(): Rarity {
  const random = Math.random();
  let cumulative = 0;
  
  const rarities: Rarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
  
  for (const rarity of rarities) {
    cumulative += RARITY_CHANCES[rarity];
    if (random <= cumulative) {
      return rarity;
    }
  }
  
  return 'common';
}

export function generateEquipment(type: EquipmentType, characterClass: CharacterClass): Equipment {
  const rarity = generateRandomRarity();
  const multiplier = RARITY_STAT_MULTIPLIERS[rarity];
  
  let name = '';
  const stats: Equipment['stats'] = {};
  
  switch (type) {
    case 'weapon':
      name = WEAPON_NAMES[characterClass][Math.floor(Math.random() * WEAPON_NAMES[characterClass].length)];
      stats.attack = Math.floor((3 + Math.random() * 5) * multiplier);
      stats.critChance = Math.floor((2 + Math.random() * 3) * multiplier);
      break;
    case 'armor':
      name = ARMOR_NAMES[Math.floor(Math.random() * ARMOR_NAMES.length)];
      stats.defense = Math.floor((3 + Math.random() * 5) * multiplier);
      stats.health = Math.floor((10 + Math.random() * 15) * multiplier);
      stats.evasion = Math.floor((1 + Math.random() * 2) * multiplier);
      break;
    case 'accessory':
      name = ACCESSORY_NAMES[Math.floor(Math.random() * ACCESSORY_NAMES.length)];
      stats.luck = Math.floor((2 + Math.random() * 4) * multiplier);
      stats.speed = Math.floor((1 + Math.random() * 3) * multiplier);
      stats.evasion = Math.floor((1 + Math.random() * 2) * multiplier);
      break;
  }
  
  const rarityPrefix = rarity.charAt(0).toUpperCase() + rarity.slice(1);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${rarityPrefix} ${name}`,
    type,
    rarity,
    stats,
  };
}

export function shouldDropLoot(): boolean {
  return Math.random() < 0.3; // 30% chance to drop equipment
}

export function calculateEquipmentStats(equipment: Equipment[]) {
  return equipment.reduce((total, item) => {
    Object.entries(item.stats).forEach(([key, value]) => {
      if (value) {
        total[key] = (total[key] || 0) + value;
      }
    });
    return total;
  }, {} as Record<string, number>);
}
