import { Character } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';

export interface PvPMatchResult {
  winner: 'attacker' | 'defender';
  combatLog: Array<{
    message: string;
    type: 'attack' | 'damage' | 'victory' | 'defeat';
  }>;
  attackerFinalHealth: number;
  defenderFinalHealth: number;
  ratingChange: number;
}

// Seeded random number generator for deterministic combat
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

export function calculateDamage(
  attacker: Character,
  defender: Character,
  rng: SeededRandom
): { damage: number; isCrit: boolean; isEvaded: boolean } {
  // Check evasion
  const evasionChance = defender.stats.evasion + (defender.stats.luck * 0.5);
  if (rng.next() * 100 < evasionChance) {
    return { damage: 0, isCrit: false, isEvaded: true };
  }
  
  const baseDamage = attacker.stats.attack;
  const defense = defender.stats.defense;
  const randomFactor = 0.8 + rng.next() * 0.4; // 80% to 120%
  
  let damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * randomFactor));
  
  // Check critical hit
  const critChance = attacker.stats.critChance + (attacker.stats.luck * 0.5);
  const isCrit = rng.next() * 100 < critChance;
  
  if (isCrit) {
    damage = Math.floor(damage * 2);
  }
  
  return { damage, isCrit, isEvaded: false };
}

export function simulatePvPMatch(
  attacker: Character,
  defender: Character,
  attackerRating: number,
  defenderRating: number
): PvPMatchResult {
  // Use timestamp as seed for deterministic but unique combat
  const seed = Date.now();
  const rng = new SeededRandom(seed);

  const combatLog: PvPMatchResult['combatLog'] = [];
  
  // Create copies to avoid mutating original
  const attackerState = { ...attacker, stats: { ...attacker.stats } };
  const defenderState = { ...defender, stats: { ...defender.stats } };

  // Determine first attacker based on speed
  let currentAttacker = attackerState.stats.speed >= defenderState.stats.speed ? 'attacker' : 'defender';
  
  combatLog.push({
    message: `${currentAttacker === 'attacker' ? attacker.name : defender.name} strikes first!`,
    type: 'attack'
  });

  let turn = 0;
  const maxTurns = 50; // Prevent infinite loops

  while (attackerState.stats.health > 0 && defenderState.stats.health > 0 && turn < maxTurns) {
    turn++;
    
    const isAttackerTurn = currentAttacker === 'attacker';
    const activeChar = isAttackerTurn ? attackerState : defenderState;
    const targetChar = isAttackerTurn ? defenderState : attackerState;

    const { damage, isCrit, isEvaded } = calculateDamage(activeChar, targetChar, rng);

    if (isEvaded) {
      combatLog.push({
        message: `${targetChar.name} evaded ${activeChar.name}'s attack!`,
        type: 'attack'
      });
    } else {
      targetChar.stats.health -= damage;
      const critText = isCrit ? ' CRITICAL HIT!' : '';
      combatLog.push({
        message: `${activeChar.name} deals ${damage} damage to ${targetChar.name}!${critText}`,
        type: 'damage'
      });
    }

    // Switch turns
    currentAttacker = isAttackerTurn ? 'defender' : 'attacker';
  }

  const winner = attackerState.stats.health > 0 ? 'attacker' : 'defender';
  const winnerName = winner === 'attacker' ? attacker.name : defender.name;
  
  combatLog.push({
    message: `${winnerName} is victorious!`,
    type: winner === 'attacker' ? 'victory' : 'defeat'
  });

  // Calculate ELO rating change
  const ratingChange = calculateEloChange(attackerRating, defenderRating, winner === 'attacker');

  return {
    winner,
    combatLog,
    attackerFinalHealth: Math.max(0, attackerState.stats.health),
    defenderFinalHealth: Math.max(0, defenderState.stats.health),
    ratingChange
  };
}

export function calculateEloChange(
  attackerRating: number,
  defenderRating: number,
  attackerWon: boolean
): number {
  // K-factor: higher for lower rated players
  const K = attackerRating < 1200 ? 32 : 24;
  
  // Expected score
  const expectedScore = 1 / (1 + Math.pow(10, (defenderRating - attackerRating) / 400));
  
  // Actual score
  const actualScore = attackerWon ? 1 : 0;
  
  // Rating change
  const change = Math.round(K * (actualScore - expectedScore));
  
  return change;
}

export async function savePvPMatch(
  attackerId: string,
  defenderId: string,
  matchResult: PvPMatchResult,
  attackerSnapshot: Character,
  defenderSnapshot: Character
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pvp_matches')
      .insert([{
        attacker_id: attackerId,
        defender_id: defenderId,
        winner_id: matchResult.winner === 'attacker' ? attackerId : defenderId,
        attacker_snapshot: attackerSnapshot as any,
        defender_snapshot: defenderSnapshot as any,
        combat_log: matchResult.combatLog as any,
        rating_change: matchResult.ratingChange
      }]);

    return !error;
  } catch (error) {
    console.error('Error saving PvP match:', error);
    return false;
  }
}

export async function getMatchHistory(userId: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('pvp_matches')
      .select(`
        id,
        created_at,
        winner_id,
        rating_change,
        attacker_id,
        defender_id,
        attacker_snapshot,
        defender_snapshot,
        combat_log
      `)
      .or(`attacker_id.eq.${userId},defender_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching match history:', error);
    return [];
  }
}

export async function loadOpponentSnapshot(opponentId: string): Promise<Character | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('character_data')
      .eq('id', opponentId)
      .single();

    if (error || !data?.character_data) {
      return null;
    }

    const charData = data.character_data as any;
    return charData.character || null;
  } catch (error) {
    console.error('Error loading opponent snapshot:', error);
    return null;
  }
}
