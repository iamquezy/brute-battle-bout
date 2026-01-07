import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Sword, Shield, Heart, Zap, Trophy, Skull, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Character } from '@/types/game';

interface DungeonRunProps {
  userId: string;
  player: Character;
  onBack: () => void;
  onRewardsCollected: (gold: number, xp: number) => void;
}

interface DungeonEnemy {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  type: 'normal' | 'elite' | 'boss';
}

interface CombatLogEntry {
  type: 'player' | 'enemy' | 'system';
  message: string;
  damage?: number;
  critical?: boolean;
}

const DUNGEONS = [
  { id: 'crypt', name: 'Forgotten Crypt', minLevel: 1, floors: 10, difficulty: 1 },
  { id: 'forest', name: 'Cursed Forest', minLevel: 10, floors: 15, difficulty: 1.5 },
  { id: 'volcano', name: 'Volcanic Depths', minLevel: 20, floors: 20, difficulty: 2 },
  { id: 'void', name: 'Void Rift', minLevel: 35, floors: 25, difficulty: 3 },
  { id: 'celestial', name: 'Celestial Tower', minLevel: 50, floors: 30, difficulty: 4 },
];

const ENEMY_TYPES = [
  { name: 'Skeleton Warrior', type: 'normal' as const },
  { name: 'Shadow Stalker', type: 'normal' as const },
  { name: 'Corrupted Knight', type: 'elite' as const },
  { name: 'Demon Spawn', type: 'normal' as const },
  { name: 'Void Walker', type: 'elite' as const },
  { name: 'Ancient Guardian', type: 'boss' as const },
  { name: 'Dragon Wyrm', type: 'boss' as const },
];

function generateEnemy(floor: number, difficulty: number, isBoss: boolean): DungeonEnemy {
  const baseLevel = Math.floor(floor * difficulty);
  const enemyPool = isBoss 
    ? ENEMY_TYPES.filter(e => e.type === 'boss')
    : floor % 5 === 0 
      ? ENEMY_TYPES.filter(e => e.type === 'elite')
      : ENEMY_TYPES.filter(e => e.type === 'normal');
  
  const enemyType = enemyPool[Math.floor(Math.random() * enemyPool.length)];
  const levelMultiplier = isBoss ? 2 : enemyType.type === 'elite' ? 1.5 : 1;
  const level = Math.floor(baseLevel * levelMultiplier);
  
  return {
    name: enemyType.name,
    level,
    type: enemyType.type,
    health: Math.floor((50 + level * 15) * levelMultiplier),
    maxHealth: Math.floor((50 + level * 15) * levelMultiplier),
    attack: Math.floor((10 + level * 3) * levelMultiplier),
    defense: Math.floor((5 + level * 2) * levelMultiplier),
  };
}

export function DungeonRun({ userId, player, onBack, onRewardsCollected }: DungeonRunProps) {
  const [selectedDungeon, setSelectedDungeon] = useState<typeof DUNGEONS[0] | null>(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(player.stats.health);
  const [enemy, setEnemy] = useState<DungeonEnemy | null>(null);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [totalGold, setTotalGold] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [runStatus, setRunStatus] = useState<'selecting' | 'fighting' | 'victory' | 'defeat'>('selecting');

  const addLog = useCallback((entry: CombatLogEntry) => {
    setCombatLog(prev => [...prev.slice(-50), entry]);
  }, []);

  const startDungeon = (dungeon: typeof DUNGEONS[0]) => {
    setSelectedDungeon(dungeon);
    setCurrentFloor(1);
    setPlayerHealth(player.stats.health);
    setTotalGold(0);
    setTotalXp(0);
    setCombatLog([]);
    setRunStatus('fighting');
    spawnEnemy(1, dungeon.difficulty, dungeon.floors);
  };

  const spawnEnemy = (floor: number, difficulty: number, maxFloors: number) => {
    const isBoss = floor === maxFloors;
    const newEnemy = generateEnemy(floor, difficulty, isBoss);
    setEnemy(newEnemy);
    addLog({ 
      type: 'system', 
      message: `Floor ${floor}: ${newEnemy.name} (Lv.${newEnemy.level}) appears!` 
    });
  };

  const performAttack = useCallback(() => {
    if (!enemy || !selectedDungeon) return;

    // Player attacks
    const playerDamage = Math.max(1, player.stats.attack - enemy.defense / 2);
    const isCrit = Math.random() < (player.stats.critChance || 0.1);
    const finalDamage = Math.floor(playerDamage * (isCrit ? 2 : 1) * (0.9 + Math.random() * 0.2));
    
    const newEnemyHealth = Math.max(0, enemy.health - finalDamage);
    setEnemy({ ...enemy, health: newEnemyHealth });
    
    addLog({
      type: 'player',
      message: `You deal ${finalDamage} damage${isCrit ? ' (CRIT!)' : ''}`,
      damage: finalDamage,
      critical: isCrit,
    });

    if (newEnemyHealth <= 0) {
      // Enemy defeated
      const goldReward = Math.floor((10 + enemy.level * 5) * (enemy.type === 'boss' ? 5 : enemy.type === 'elite' ? 2 : 1));
      const xpReward = Math.floor((20 + enemy.level * 10) * (enemy.type === 'boss' ? 5 : enemy.type === 'elite' ? 2 : 1));
      
      setTotalGold(prev => prev + goldReward);
      setTotalXp(prev => prev + xpReward);
      
      addLog({ 
        type: 'system', 
        message: `${enemy.name} defeated! +${goldReward} gold, +${xpReward} XP` 
      });

      if (currentFloor >= selectedDungeon.floors) {
        // Dungeon complete
        setRunStatus('victory');
        addLog({ type: 'system', message: '🎉 DUNGEON COMPLETE!' });
      } else {
        // Next floor
        setTimeout(() => {
          setCurrentFloor(prev => prev + 1);
          spawnEnemy(currentFloor + 1, selectedDungeon.difficulty, selectedDungeon.floors);
        }, 500);
      }
      return;
    }

    // Enemy attacks back
    setTimeout(() => {
      const enemyDamage = Math.max(1, enemy.attack - player.stats.defense / 2);
      const enemyFinalDamage = Math.floor(enemyDamage * (0.9 + Math.random() * 0.2));
      
      setPlayerHealth(prev => {
        const newHealth = Math.max(0, prev - enemyFinalDamage);
        
        addLog({
          type: 'enemy',
          message: `${enemy.name} deals ${enemyFinalDamage} damage`,
          damage: enemyFinalDamage,
        });

        if (newHealth <= 0) {
          setRunStatus('defeat');
          addLog({ type: 'system', message: '💀 You have been defeated!' });
        }
        
        return newHealth;
      });
    }, 300);
  }, [enemy, player, currentFloor, selectedDungeon, addLog]);

  // Auto-combat effect
  useEffect(() => {
    if (!isAutoMode || runStatus !== 'fighting' || !enemy) return;

    const interval = setInterval(() => {
      performAttack();
    }, 800);

    return () => clearInterval(interval);
  }, [isAutoMode, runStatus, enemy, performAttack]);

  const collectRewards = async () => {
    try {
      await supabase.from('dungeon_runs').insert({
        user_id: userId,
        dungeon_id: selectedDungeon!.id,
        current_floor: currentFloor,
        max_floor_reached: currentFloor,
        status: runStatus === 'victory' ? 'completed' : 'failed',
        rewards: { gold: totalGold, xp: totalXp },
        completed_at: new Date().toISOString(),
      });

      onRewardsCollected(totalGold, totalXp);
      toast.success(`Collected ${totalGold} gold and ${totalXp} XP!`);
      setRunStatus('selecting');
      setSelectedDungeon(null);
    } catch (error) {
      console.error('Error saving dungeon run:', error);
      toast.error('Failed to save progress');
    }
  };

  const playerLevel = player.level || 1;
  const healthPercent = (playerHealth / player.stats.health) * 100;
  const enemyHealthPercent = enemy ? (enemy.health / enemy.maxHealth) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sword className="h-6 w-6 text-primary" />
              Dungeon Runs
            </CardTitle>
            <CardDescription>
              Clear floors of increasingly difficult enemies for rewards
            </CardDescription>
          </CardHeader>

          <CardContent>
            {runStatus === 'selecting' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DUNGEONS.map((dungeon) => {
                  const isUnlocked = playerLevel >= dungeon.minLevel;
                  return (
                    <Card 
                      key={dungeon.id}
                      className={`cursor-pointer transition-all ${
                        isUnlocked 
                          ? 'hover:border-primary/50 hover:bg-primary/5' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => isUnlocked && startDungeon(dungeon)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{dungeon.name}</h3>
                          <Badge variant={isUnlocked ? 'default' : 'secondary'}>
                            Lv.{dungeon.minLevel}+
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {dungeon.floors} Floors • Difficulty x{dungeon.difficulty}
                        </p>
                        {isUnlocked ? (
                          <Button size="sm" className="w-full">
                            Enter Dungeon
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">
                            Reach level {dungeon.minLevel} to unlock
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {runStatus === 'fighting' && selectedDungeon && enemy && (
              <div className="space-y-4">
                {/* Progress */}
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {selectedDungeon.name}
                  </Badge>
                  <Badge className="text-lg px-3 py-1">
                    Floor {currentFloor}/{selectedDungeon.floors}
                  </Badge>
                </div>

                {/* Combat Arena */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Player */}
                  <Card className="bg-primary/5 border-primary/30">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold mb-2">{player.name}</h4>
                      <Badge className="mb-3">Lv.{playerLevel}</Badge>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <Progress value={healthPercent} className="h-3" />
                        </div>
                        <p className="text-sm">{playerHealth}/{player.stats.health} HP</p>
                        <div className="flex justify-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Sword className="h-3 w-3" />{player.stats.attack}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />{player.stats.defense}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enemy */}
                  <Card className={`border-destructive/30 ${
                    enemy.type === 'boss' ? 'bg-destructive/10' : 
                    enemy.type === 'elite' ? 'bg-yellow-500/10' : 'bg-muted/50'
                  }`}>
                    <CardContent className="p-4 text-center">
                      <h4 className="font-bold mb-2">{enemy.name}</h4>
                      <Badge variant={enemy.type === 'boss' ? 'destructive' : enemy.type === 'elite' ? 'default' : 'secondary'} className="mb-3">
                        {enemy.type.toUpperCase()} Lv.{enemy.level}
                      </Badge>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <Progress value={enemyHealthPercent} className="h-3 [&>div]:bg-destructive" />
                        </div>
                        <p className="text-sm">{enemy.health}/{enemy.maxHealth} HP</p>
                        <div className="flex justify-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Sword className="h-3 w-3" />{enemy.attack}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />{enemy.defense}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Combat Log */}
                <Card className="bg-card/50">
                  <CardContent className="p-3">
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-1 text-sm font-mono">
                        {combatLog.map((entry, i) => (
                          <p key={i} className={
                            entry.type === 'player' ? 'text-primary' :
                            entry.type === 'enemy' ? 'text-destructive' :
                            'text-muted-foreground'
                          }>
                            {entry.message}
                          </p>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Controls */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={performAttack}
                    disabled={isAutoMode}
                  >
                    <Sword className="h-4 w-4 mr-2" />
                    Attack
                  </Button>
                  <Button
                    variant={isAutoMode ? 'default' : 'outline'}
                    onClick={() => setIsAutoMode(!isAutoMode)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isAutoMode ? 'Auto: ON' : 'Auto: OFF'}
                  </Button>
                </div>

                {/* Rewards Display */}
                <div className="flex justify-center gap-6 text-sm">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gold" />
                    {totalGold.toLocaleString()} Gold
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    {totalXp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            )}

            {(runStatus === 'victory' || runStatus === 'defeat') && (
              <div className="text-center py-8 space-y-4">
                {runStatus === 'victory' ? (
                  <>
                    <Trophy className="h-16 w-16 mx-auto text-gold animate-pulse" />
                    <h3 className="text-2xl font-bold text-gold">Victory!</h3>
                    <p className="text-muted-foreground">
                      You cleared all {selectedDungeon?.floors} floors!
                    </p>
                  </>
                ) : (
                  <>
                    <Skull className="h-16 w-16 mx-auto text-destructive" />
                    <h3 className="text-2xl font-bold text-destructive">Defeated</h3>
                    <p className="text-muted-foreground">
                      You reached floor {currentFloor} of {selectedDungeon?.floors}
                    </p>
                  </>
                )}
                
                <div className="flex justify-center gap-6 text-lg">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-gold" />
                    {totalGold.toLocaleString()} Gold
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    {totalXp.toLocaleString()} XP
                  </span>
                </div>

                <Button size="lg" onClick={collectRewards}>
                  Collect Rewards & Exit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
