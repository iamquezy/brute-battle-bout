import { supabase } from '@/integrations/supabase/client';
import { Character } from '@/types/game';

export interface PrestigeBonus {
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  goldMultiplier: number;
  expMultiplier: number;
}

export interface PrestigeRecord {
  id: string;
  user_id: string;
  prestige_level: number;
  total_prestiges: number;
  bonuses: PrestigeBonus;
  last_prestige_at: string | null;
  updated_at: string;
}

export const PRESTIGE_REQUIREMENTS = {
  minLevel: 50,
  goldCost: 10000
};

export function calculatePrestigeBonuses(prestigeLevel: number): PrestigeBonus {
  const baseBonus = 0.05; // 5% per prestige
  const multiplier = prestigeLevel * baseBonus;

  return {
    attackBonus: Math.floor(10 * multiplier),
    defenseBonus: Math.floor(8 * multiplier),
    healthBonus: Math.floor(50 * multiplier),
    goldMultiplier: 1 + (multiplier * 0.5),
    expMultiplier: 1 + (multiplier * 0.3)
  };
}

export function canPrestige(character: Character, gold: number): { canPrestige: boolean; reason?: string } {
  if (character.level < PRESTIGE_REQUIREMENTS.minLevel) {
    return {
      canPrestige: false,
      reason: `Must reach level ${PRESTIGE_REQUIREMENTS.minLevel}`
    };
  }

  if (gold < PRESTIGE_REQUIREMENTS.goldCost) {
    return {
      canPrestige: false,
      reason: `Need ${PRESTIGE_REQUIREMENTS.goldCost} gold`
    };
  }

  return { canPrestige: true };
}

export async function performPrestige(
  userId: string,
  currentCharacter: Character
): Promise<{ success: boolean; newPrestigeLevel?: number; error?: string }> {
  try {
    // Get current prestige record
    const { data: existing, error: fetchError } = await supabase
      .from('prestige_records')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const newPrestigeLevel = existing ? existing.prestige_level + 1 : 1;
    const newTotalPrestiges = existing ? existing.total_prestiges + 1 : 1;
    const newBonuses = calculatePrestigeBonuses(newPrestigeLevel);

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('prestige_records')
        .update({
          prestige_level: newPrestigeLevel,
          total_prestiges: newTotalPrestiges,
          bonuses: newBonuses as any,
          last_prestige_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('prestige_records')
        .insert({
          user_id: userId,
          prestige_level: newPrestigeLevel,
          total_prestiges: newTotalPrestiges,
          bonuses: newBonuses as any,
          last_prestige_at: new Date().toISOString()
        });

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    return { success: true, newPrestigeLevel };
  } catch (error) {
    return { success: false, error: 'Failed to perform prestige' };
  }
}

export async function getPrestigeRecord(userId: string): Promise<PrestigeRecord | null> {
  try {
    const { data, error } = await supabase
      .from('prestige_records')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? { ...data, bonuses: data.bonuses as any as PrestigeBonus } : null;
  } catch (error) {
    console.error('Error fetching prestige record:', error);
    return null;
  }
}

export function applyPrestigeBonuses(character: Character, bonuses: PrestigeBonus): Character {
  return {
    ...character,
    stats: {
      ...character.stats,
      maxHealth: character.stats.maxHealth + bonuses.healthBonus,
      health: character.stats.maxHealth + bonuses.healthBonus,
      attack: character.stats.attack + bonuses.attackBonus,
      defense: character.stats.defense + bonuses.defenseBonus
    }
  };
}

export function getPrestigeResetCharacter(currentClass: string, bonuses: PrestigeBonus): Character {
  const baseStats = {
    fighter: { health: 120, attack: 15, defense: 12, speed: 8 },
    mage: { health: 80, attack: 20, defense: 6, speed: 12 },
    archer: { health: 100, attack: 18, defense: 8, speed: 15 }
  };

  const stats = baseStats[currentClass as keyof typeof baseStats];

  return {
    id: crypto.randomUUID(),
    name: 'Hero',
    class: currentClass as 'fighter' | 'mage' | 'archer',
    level: 1,
    experience: 0,
    gold: 0,
    stats: {
      health: stats.health + bonuses.healthBonus,
      maxHealth: stats.health + bonuses.healthBonus,
      attack: stats.attack + bonuses.attackBonus,
      defense: stats.defense + bonuses.defenseBonus,
      speed: stats.speed,
      critChance: 0.1,
      evasion: 0.05,
      luck: 5
    }
  };
}
