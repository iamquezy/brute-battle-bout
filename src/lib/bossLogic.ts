import { supabase } from '@/integrations/supabase/client';
import { Character } from '@/types/game';
import { Boss, BossAbility } from './bossData';

export interface BossCombatResult {
  victory: boolean;
  combatLog: string[];
  timeTaken: number;
  totalDamage: number;
  rewards: any;
  playerFinalHealth: number;
  bossFinalHealth: number;
}

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export function simulateBossFight(
  player: Character,
  boss: Boss,
  seed: number = Date.now()
): BossCombatResult {
  const rng = new SeededRandom(seed);
  const combatLog: string[] = [];
  
  let playerHealth = player.stats.health;
  let bossHealth = boss.health;
  let turn = 0;
  let totalDamage = 0;
  let bossEnraged = false;

  combatLog.push(`${player.name} challenges ${boss.name}!`);
  combatLog.push(`Boss Health: ${bossHealth} | Player Health: ${playerHealth}`);

  while (playerHealth > 0 && bossHealth > 0 && turn < 100) {
    turn++;

    // Boss enrage at low health
    if (bossHealth < boss.health * 0.25 && !bossEnraged) {
      bossEnraged = true;
      combatLog.push(`💢 ${boss.name} enters an ENRAGED state!`);
    }

    // Player turn
    const playerSpeed = player.stats.speed + rng.next() * 10;
    const bossSpeed = boss.speed + rng.next() * 10;

    if (playerSpeed >= bossSpeed) {
      // Player attacks
      const evaded = rng.next() < 0.05;
      if (evaded) {
        combatLog.push(`💨 ${player.name}'s attack missed!`);
      } else {
        let damage = Math.max(1, player.stats.attack - Math.floor(boss.defense * 0.5));
        const isCrit = rng.next() < player.stats.critChance;
        if (isCrit) {
          damage = Math.floor(damage * 2);
          combatLog.push(`⚔️ ${player.name} lands a CRITICAL HIT for ${damage} damage!`);
        } else {
          combatLog.push(`⚔️ ${player.name} attacks for ${damage} damage`);
        }
        bossHealth -= damage;
        totalDamage += damage;
      }

      if (bossHealth <= 0) break;

      // Boss turn
      const ability = boss.abilities[Math.floor(rng.next() * boss.abilities.length)];
      if (rng.next() < ability.chance) {
        let bossDamage = ability.damage;
        if (ability.damage > 0) {
          // Check if ability is armor-ignoring (shadow strike)
          if (ability.name === 'Shadow Strike') {
            bossDamage = ability.damage;
          } else {
            bossDamage = Math.max(1, ability.damage - player.stats.defense);
          }
          
          if (bossEnraged) {
            bossDamage = Math.floor(bossDamage * 1.5);
          }

          playerHealth -= bossDamage;
          combatLog.push(`🔥 ${boss.name} uses ${ability.name} for ${bossDamage} damage!`);

          if (ability.effect === 'lifesteal') {
            bossHealth = Math.min(boss.health, bossHealth + Math.floor(bossDamage * 0.5));
            combatLog.push(`💉 ${boss.name} steals ${Math.floor(bossDamage * 0.5)} health!`);
          } else if (ability.effect === 'burn') {
            combatLog.push(`🔥 ${player.name} is burning!`);
          } else if (ability.effect === 'freeze') {
            combatLog.push(`❄️ ${player.name} is frozen!`);
          }
        } else {
          // Defensive ability
          combatLog.push(`🛡️ ${boss.name} uses ${ability.name}!`);
        }
      } else {
        // Normal boss attack
        let bossDamage = Math.max(1, boss.attack - player.stats.defense);
        if (bossEnraged) {
          bossDamage = Math.floor(bossDamage * 1.5);
        }
        playerHealth -= bossDamage;
        combatLog.push(`👊 ${boss.name} attacks for ${bossDamage} damage`);
      }
    } else {
      // Boss attacks first
      const ability = boss.abilities[Math.floor(rng.next() * boss.abilities.length)];
      if (rng.next() < ability.chance) {
        let bossDamage = ability.damage;
        if (ability.damage > 0) {
          if (ability.name === 'Shadow Strike') {
            bossDamage = ability.damage;
          } else {
            bossDamage = Math.max(1, ability.damage - player.stats.defense);
          }
          
          if (bossEnraged) {
            bossDamage = Math.floor(bossDamage * 1.5);
          }

          playerHealth -= bossDamage;
          combatLog.push(`🔥 ${boss.name} uses ${ability.name} for ${bossDamage} damage!`);

          if (ability.effect === 'lifesteal') {
            bossHealth = Math.min(boss.health, bossHealth + Math.floor(bossDamage * 0.5));
            combatLog.push(`💉 ${boss.name} steals ${Math.floor(bossDamage * 0.5)} health!`);
          }
        } else {
          combatLog.push(`🛡️ ${boss.name} uses ${ability.name}!`);
        }
      } else {
        let bossDamage = Math.max(1, boss.attack - player.stats.defense);
        if (bossEnraged) {
          bossDamage = Math.floor(bossDamage * 1.5);
        }
        playerHealth -= bossDamage;
        combatLog.push(`👊 ${boss.name} attacks for ${bossDamage} damage`);
      }

      if (playerHealth <= 0) break;

      // Player turn
      const evaded = rng.next() < 0.05;
      if (evaded) {
        combatLog.push(`💨 ${player.name}'s attack missed!`);
      } else {
        let damage = Math.max(1, player.stats.attack - Math.floor(boss.defense * 0.5));
        const isCrit = rng.next() < player.stats.critChance;
        if (isCrit) {
          damage = Math.floor(damage * 2);
          combatLog.push(`⚔️ ${player.name} lands a CRITICAL HIT for ${damage} damage!`);
        } else {
          combatLog.push(`⚔️ ${player.name} attacks for ${damage} damage`);
        }
        bossHealth -= damage;
        totalDamage += damage;
      }
    }

    if (turn % 5 === 0) {
      combatLog.push(`--- Turn ${turn} | Boss: ${Math.max(0, bossHealth)}HP | Player: ${Math.max(0, playerHealth)}HP ---`);
    }
  }

  const victory = bossHealth <= 0 && playerHealth > 0;

  if (victory) {
    combatLog.push(`🎉 VICTORY! ${player.name} defeated ${boss.name}!`);
  } else {
    combatLog.push(`💀 DEFEAT! ${player.name} was overwhelmed by ${boss.name}...`);
  }

  return {
    victory,
    combatLog,
    timeTaken: turn,
    totalDamage,
    rewards: victory ? boss.rewards : {},
    playerFinalHealth: Math.max(0, playerHealth),
    bossFinalHealth: Math.max(0, bossHealth)
  };
}

export async function saveBossFight(
  userId: string,
  bossId: string,
  result: BossCombatResult
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('boss_fights')
      .insert({
        user_id: userId,
        boss_id: bossId,
        victory: result.victory,
        damage_dealt: result.totalDamage,
        time_taken: result.timeTaken,
        rewards: result.rewards,
        combat_log: result.combatLog
      });

    if (error) throw error;

    // Update leaderboard if victory
    if (result.victory) {
      await updateBossLeaderboard(userId, bossId, result.timeTaken, result.totalDamage);
    }

    return true;
  } catch (error) {
    console.error('Error saving boss fight:', error);
    return false;
  }
}

async function updateBossLeaderboard(
  userId: string,
  bossId: string,
  timeTaken: number,
  damage: number
): Promise<void> {
  try {
    // Get username
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const { data: existing } = await supabase
      .from('boss_leaderboard')
      .select('*')
      .eq('user_id', userId)
      .eq('boss_id', bossId)
      .maybeSingle();

    if (existing) {
      // Update if better
      const updates: any = { victories: existing.victories + 1 };
      if (timeTaken < existing.best_time) updates.best_time = timeTaken;
      if (damage > existing.highest_damage) updates.highest_damage = damage;

      await supabase
        .from('boss_leaderboard')
        .update(updates)
        .eq('user_id', userId)
        .eq('boss_id', bossId);
    } else {
      // Create new entry
      await supabase
        .from('boss_leaderboard')
        .insert({
          user_id: userId,
          username: profile.username,
          boss_id: bossId,
          best_time: timeTaken,
          highest_damage: damage,
          victories: 1
        });
    }
  } catch (error) {
    console.error('Error updating boss leaderboard:', error);
  }
}

export async function getBossLeaderboard(bossId: string, limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('boss_leaderboard')
      .select('*')
      .eq('boss_id', bossId)
      .order('best_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching boss leaderboard:', error);
    return [];
  }
}

export async function getUserBossFights(userId: string, bossId?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('boss_fights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (bossId) {
      query = query.eq('boss_id', bossId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching boss fights:', error);
    return [];
  }
}
