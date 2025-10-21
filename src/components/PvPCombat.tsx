import { useState, useEffect } from 'react';
import { Character } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { simulatePvPMatch, savePvPMatch, loadOpponentSnapshot, PvPMatchResult } from '@/lib/pvpLogic';
import { calculatePvPRewards, formatMaterialName } from '@/lib/pvpRewards';
import { Swords, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';

interface PvPCombatProps {
  player: Character;
  userId: string;
  playerRating: number;
  opponentId: string;
  opponentName: string;
  onCombatEnd: (result: PvPMatchResult, rewards: any, newRating: number) => void;
  onBack: () => void;
}

export function PvPCombat({ player, userId, playerRating, opponentId, opponentName, onCombatEnd, onBack }: PvPCombatProps) {
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [opponentRating, setOpponentRating] = useState(1000);
  const [combatStarted, setCombatStarted] = useState(false);
  const [combatResult, setCombatResult] = useState<PvPMatchResult | null>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const avatarMap = {
    fighter: warriorAvatar,
    mage: mageAvatar,
    archer: archerAvatar
  };

  useEffect(() => {
    loadOpponent();
  }, [opponentId]);

  const loadOpponent = async () => {
    setLoading(true);
    try {
      // Load opponent character snapshot
      const opponentChar = await loadOpponentSnapshot(opponentId);
      
      if (!opponentChar) {
        toast.error('Failed to load opponent data');
        onBack();
        return;
      }

      // Load opponent rating from leaderboard
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: leaderboardData } = await supabase
        .from('leaderboard')
        .select('rating')
        .eq('user_id', opponentId)
        .single();

      setOpponent(opponentChar);
      setOpponentRating(leaderboardData?.rating || 1000);
    } catch (error) {
      console.error('Error loading opponent:', error);
      toast.error('Failed to load opponent');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const startCombat = async () => {
    if (!opponent) return;

    setCombatStarted(true);
    
    // Simulate combat with delay for effect
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = simulatePvPMatch(player, opponent, playerRating, opponentRating);
    const won = result.winner === 'attacker';
    
    // Calculate rewards
    const ratingDiff = opponentRating - playerRating;
    const pvpRewards = calculatePvPRewards(player, opponent, ratingDiff, 0);
    
    setCombatResult(result);
    setRewards(pvpRewards);

    // Save match to database
    await savePvPMatch(userId, opponentId, result, player, opponent);

    // Calculate new rating
    const newRating = playerRating + (won ? result.ratingChange : -Math.abs(result.ratingChange));

    // Show result toast
    if (won) {
      toast.success('Victory!', {
        description: `+${result.ratingChange} rating • +${pvpRewards.gold} gold`
      });
    } else {
      toast.error('Defeat', {
        description: `${result.ratingChange} rating`
      });
    }

    // Delay before calling onCombatEnd to show results
    setTimeout(() => {
      onCombatEnd(result, pvpRewards, newRating);
    }, 3000);
  };

  const getClassGradient = (characterClass: string) => {
    switch (characterClass) {
      case 'fighter':
        return 'from-red-500/20 to-orange-500/20 border-red-500/50';
      case 'mage':
        return 'from-blue-500/20 to-purple-500/20 border-blue-500/50';
      case 'archer':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/50';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/50';
    }
  };

  if (loading || !opponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Loading opponent...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Combat Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              PvP Challenge
              <Trophy className="h-8 w-8 text-primary" />
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Fighter Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Player Card */}
          <Card className={`bg-gradient-to-br ${getClassGradient(player.class)} border-2`}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <img
                  src={avatarMap[player.class]}
                  alt={player.name}
                  className="w-32 h-32 mx-auto rounded-full border-4 border-primary"
                />
                <div>
                  <h3 className="text-2xl font-bold">{player.name}</h3>
                  <Badge variant="outline" className="mt-1">You</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Level {player.level} {player.class.charAt(0).toUpperCase() + player.class.slice(1)}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{playerRating}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>HP:</span>
                    <span className="font-semibold">{player.stats.maxHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attack:</span>
                    <span className="font-semibold">{player.stats.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Defense:</span>
                    <span className="font-semibold">{player.stats.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-semibold">{player.stats.speed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opponent Card */}
          <Card className={`bg-gradient-to-br ${getClassGradient(opponent.class)} border-2`}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <img
                  src={avatarMap[opponent.class]}
                  alt={opponent.name}
                  className="w-32 h-32 mx-auto rounded-full border-4 border-destructive"
                />
                <div>
                  <h3 className="text-2xl font-bold">{opponentName}</h3>
                  <Badge variant="destructive" className="mt-1">Opponent</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Level {opponent.level} {opponent.class.charAt(0).toUpperCase() + opponent.class.slice(1)}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{opponentRating}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>HP:</span>
                    <span className="font-semibold">{opponent.stats.maxHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attack:</span>
                    <span className="font-semibold">{opponent.stats.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Defense:</span>
                    <span className="font-semibold">{opponent.stats.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-semibold">{opponent.stats.speed}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Combat Log / Results */}
        {combatResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                {combatResult.winner === 'attacker' ? (
                  <>
                    <Trophy className="h-6 w-6 text-green-500" />
                    <span className="text-green-500">Victory!</span>
                  </>
                ) : (
                  <>
                    <Trophy className="h-6 w-6 text-red-500" />
                    <span className="text-red-500">Defeat</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Combat Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Rating Change:</span>
                      <span className={`font-bold flex items-center gap-1 ${combatResult.winner === 'attacker' ? 'text-green-500' : 'text-red-500'}`}>
                        {combatResult.winner === 'attacker' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {combatResult.winner === 'attacker' ? '+' : '-'}{Math.abs(combatResult.ratingChange)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>New Rating:</span>
                      <span className="font-bold">{playerRating + (combatResult.winner === 'attacker' ? combatResult.ratingChange : -Math.abs(combatResult.ratingChange))}</span>
                    </div>
                  </div>
                </div>

                {rewards && combatResult.winner === 'attacker' && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Rewards</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Gold:</span>
                        <span className="font-bold text-primary">+{rewards.gold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="font-bold text-primary">+{rewards.experience}</span>
                      </div>
                      {rewards.materials && (
                        <div className="flex justify-between">
                          <span>Material:</span>
                          <span className="font-bold text-primary">
                            {formatMaterialName(rewards.materials.type)} x{rewards.materials.amount}
                          </span>
                        </div>
                      )}
                      {rewards.streakBonus && (
                        <div className="flex justify-between">
                          <span>Streak Bonus:</span>
                          <span className="font-bold text-green-500">+{rewards.streakBonus}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <ScrollArea className="h-[200px] border rounded-lg p-4">
                <div className="space-y-2">
                  {combatResult.combatLog.map((log, index) => (
                    <div
                      key={index}
                      className={`text-sm ${
                        log.type === 'victory' ? 'text-green-500 font-bold' :
                        log.type === 'defeat' ? 'text-red-500 font-bold' :
                        log.type === 'damage' ? 'text-orange-500' :
                        'text-muted-foreground'
                      }`}
                    >
                      {log.message}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!combatStarted ? (
            <>
              <Button variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button onClick={startCombat} size="lg">
                <Swords className="h-5 w-5 mr-2" />
                Start Combat
              </Button>
            </>
          ) : (
            <Button onClick={onBack} disabled={!combatResult}>
              Back to PvP Hub
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
