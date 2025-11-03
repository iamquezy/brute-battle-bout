import { Equipment } from '@/types/equipment';

export interface DeathPenalty {
  goldLost: number;
  itemLost: Equipment | null;
}

export function calculateDeathPenalty(
  currentGold: number,
  equippedItems: { weapon: Equipment | null; armor: Equipment | null; accessory: Equipment | null }
): DeathPenalty {
  // Calculate gold loss (10% of current gold, min 0, max 5000)
  const goldLoss = Math.floor(currentGold * 0.1);
  const goldLost = Math.max(0, Math.min(goldLoss, 5000));

  // 20% chance to lose an equipped item
  let itemLost: Equipment | null = null;
  
  if (Math.random() < 0.2) {
    const equippedSlots = Object.entries(equippedItems)
      .filter(([_, item]) => item !== null)
      .map(([slot, item]) => ({ slot, item: item! }));

    if (equippedSlots.length > 0) {
      const randomSlot = equippedSlots[Math.floor(Math.random() * equippedSlots.length)];
      itemLost = randomSlot.item;
    }
  }

  return { goldLost, itemLost };
}

export interface PvPDeathResult {
  goldLost: number;
  itemLost: Equipment | null;
  winnerGained: {
    gold: number;
    item: Equipment | null;
  };
}

export function calculatePvPDeath(
  loserGold: number,
  loserEquippedItems: { weapon: Equipment | null; armor: Equipment | null; accessory: Equipment | null }
): PvPDeathResult {
  const penalty = calculateDeathPenalty(loserGold, loserEquippedItems);

  return {
    goldLost: penalty.goldLost,
    itemLost: penalty.itemLost,
    winnerGained: {
      gold: penalty.goldLost,
      item: penalty.itemLost
    }
  };
}

export function hasInsurance(inventory: any[]): boolean {
  return inventory.some(item => item.id === 'insurance' && item.quantity > 0);
}

export function useInsurance(inventory: any[]): any[] {
  return inventory.map(item => {
    if (item.id === 'insurance' && item.quantity > 0) {
      return { ...item, quantity: item.quantity - 1 };
    }
    return item;
  }).filter(item => item.quantity > 0);
}
