import { useState, useEffect } from 'react';
import { Character } from '@/types/game';
import { Boss, getBossById } from '@/lib/bossData';
import { simulateBossFight, saveBossFight, BossCombatResult, getBossLeaderboard } from '@/lib/bossLogic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skull, Swords, Trophy, ArrowLeft, Zap, Shield, Heart, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface BossBattleProps {
  player: Character;
  userId: string;
  bossId: string;
  onBattleEnd: (rewards: any) => void;
  onBack: () => void;
}

export function BossBattle({ player, userId, bossId, onBattleEnd, onBack }: BossBattleProps) {
  const [boss, setBoss] = useState<Boss | null>(null);
  const [combatResult, setCombatResult] = useState<BossCombatResult | null>(null);
  const [inCombat, setInCombat] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const bossData = getBossById(bossId);
    if (!bossData) {
      toast.error('Boss not found');
      onBack();
      return;
    }
    setBoss(bossData);
    loadLeaderboard();
  }, [bossId]);

  const loadLeaderboard = async () => {
    const data = await getBossLeaderboard(bossId, 10);
    setLeaderboard(data);
  };

  const startBattle = async () => {
    if (!boss) return;

    setInCombat(true);
    toast.info('Battle begins!');

    // Simulate combat
    const result = simulateBossFight(player, boss);
    
    // Save to database
    await saveBossFight(userId, bossId, result);
    
    setCombatResult(result);
    setInCombat(false);

    if (result.victory) {
      toast.success('Victory! Boss defeated!');
      // Reload leaderboard
      loadLeaderboard();
      // Return rewards after delay
      setTimeout(() => {
        onBattleEnd(result.rewards);
      }, 3000);
    } else {
      toast.error('Defeat! Try again when stronger.');
    }
  };

  if (!boss) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading boss data...</p>
        </div>
      </div>
    );
  }

  const playerHealthPercent = combatResult 
    ? (combatResult.playerFinalHealth / player.stats.maxHealth) * 100 
    : 100;
  const bossHealthPercent = combatResult 
    ? (combatResult.bossFinalHealth / boss.health) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Boss Selection
        </Button>

        {/* Boss Info Header */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-2">
                  <Skull className="h-8 w-8 text-destructive" />
                  {boss.name}
                </CardTitle>
                <CardDescription className="text-lg mt-2">{boss.description}</CardDescription>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">Level {boss.level}</Badge>
                  <Badge variant="destructive">Raid Boss</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Health</div>
                <div className="text-2xl font-bold text-destructive">{boss.health}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <Swords className="h-5 w-5 mx-auto mb-1 text-destructive" />
                <div className="text-sm text-muted-foreground">Attack</div>
                <div className="font-bold">{boss.attack}</div>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-sm text-muted-foreground">Defense</div>
                <div className="font-bold">{boss.defense}</div>
              </div>
              <div className="text-center">
                <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <div className="text-sm text-muted-foreground">Speed</div>
                <div className="font-bold">{boss.speed}</div>
              </div>
              <div className="text-center">
                <Heart className="h-5 w-5 mx-auto mb-1 text-destructive" />
                <div className="text-sm text-muted-foreground">HP Pool</div>
                <div className="font-bold">{boss.health}</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h4 className="font-semibold mb-2">Boss Abilities</h4>
              <div className="grid gap-2">
                {boss.abilities.map((ability, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-destructive">{ability.name}</div>
                          <div className="text-sm text-muted-foreground">{ability.description}</div>
                        </div>
                        <Badge variant="outline">{Math.round(ability.chance * 100)}% chance</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combat Area */}
        {!combatResult && (
          <Card>
            <CardHeader>
              <CardTitle>Challenge the Boss</CardTitle>
              <CardDescription>
                Your stats: Level {player.level} | ATK: {player.stats.attack} | DEF: {player.stats.defense} | HP: {player.stats.health}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={startBattle} 
                disabled={inCombat}
                size="lg"
                className="w-full"
              >
                <Swords className="h-5 w-5 mr-2" />
                {inCombat ? 'Battle in Progress...' : 'Start Battle!'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Combat Result */}
        {combatResult && (
          <Card className={combatResult.victory ? 'border-green-500' : 'border-destructive'}>
            <CardHeader>
              <CardTitle className={combatResult.victory ? 'text-green-500' : 'text-destructive'}>
                {combatResult.victory ? '🎉 VICTORY!' : '💀 DEFEAT'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Health Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Your Health</span>
                    <span>{combatResult.playerFinalHealth} / {player.stats.maxHealth}</span>
                  </div>
                  <Progress value={playerHealthPercent} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Boss Health</span>
                    <span>{combatResult.bossFinalHealth} / {boss.health}</span>
                  </div>
                  <Progress value={bossHealthPercent} className="h-3 bg-muted [&>div]:bg-destructive" />
                </div>
              </div>

              {/* Battle Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm text-muted-foreground">Turns</div>
                  <div className="font-bold">{combatResult.timeTaken}</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Swords className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm text-muted-foreground">Damage Dealt</div>
                  <div className="font-bold">{combatResult.totalDamage}</div>
                </div>
              </div>

              {/* Rewards */}
              {combatResult.victory && combatResult.rewards && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-500">Rewards Earned</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {combatResult.rewards.gold && (
                      <div>💰 Gold: <span className="font-bold">{combatResult.rewards.gold}</span></div>
                    )}
                    {combatResult.rewards.experience && (
                      <div>⭐ EXP: <span className="font-bold">{combatResult.rewards.experience}</span></div>
                    )}
                    {combatResult.rewards.prestigePoints && (
                      <div>✨ Prestige Points: <span className="font-bold">{combatResult.rewards.prestigePoints}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Combat Log */}
              <div>
                <h4 className="font-semibold mb-2">Combat Log</h4>
                <ScrollArea className="h-[300px] w-full border rounded-lg p-3">
                  <div className="space-y-1 font-mono text-xs">
                    {combatResult.combatLog.map((log, index) => (
                      <div key={index} className={
                        log.includes('CRITICAL') ? 'text-yellow-500' :
                        log.includes('VICTORY') ? 'text-green-500' :
                        log.includes('DEFEAT') ? 'text-destructive' :
                        ''
                      }>
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button onClick={() => {
                setCombatResult(null);
                if (!combatResult.victory) {
                  onBack();
                }
              }} className="w-full">
                {combatResult.victory ? 'Battle Again' : 'Return to Selection'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Fastest Victories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No records yet. Be the first!</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-3">
                        <div className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-600' : ''}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{entry.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.victories} victories • {entry.highest_damage} max damage
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{entry.best_time} turns</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
