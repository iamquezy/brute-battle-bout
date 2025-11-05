import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Swords, Coins, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SessionStats {
  wins: number;
  totalBattles: number;
  damageDealt: number;
  goldEarned: number;
  criticalHits: number;
  startTime: number;
}

interface SessionProgressProps {
  stats: SessionStats;
  onClaimReward: (tier: number) => void;
  claimedTiers: number[];
}

const SESSION_TIERS = [
  { tier: 1, wins: 3, reward: 'Gold x100', icon: Coins },
  { tier: 2, wins: 5, reward: 'Rare Item', icon: Trophy },
  { tier: 3, wins: 10, reward: 'Gold x300 + Skill Token', icon: Zap },
  { tier: 4, wins: 15, reward: 'Epic Item', icon: Target },
  { tier: 5, wins: 25, reward: 'Gold x1000 + Legendary Item', icon: Trophy },
];

export const SessionProgress = ({ stats, onClaimReward, claimedTiers }: SessionProgressProps) => {
  const sessionDuration = Math.floor((Date.now() - stats.startTime) / 1000 / 60);
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          Session Progress
        </h3>
        <Badge variant="outline">{sessionDuration}m</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-2 bg-secondary/50 rounded">
          <p className="text-2xl font-bold text-primary">{stats.wins}</p>
          <p className="text-xs text-muted-foreground">Wins</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded">
          <p className="text-2xl font-bold text-yellow-500">{stats.goldEarned}</p>
          <p className="text-xs text-muted-foreground">Gold</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded">
          <p className="text-2xl font-bold text-red-500">{stats.damageDealt}</p>
          <p className="text-xs text-muted-foreground">Damage</p>
        </div>
        <div className="p-2 bg-secondary/50 rounded">
          <p className="text-2xl font-bold text-orange-500">{stats.criticalHits}</p>
          <p className="text-xs text-muted-foreground">Crits</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">Session Rewards</p>
        {SESSION_TIERS.map((tier) => {
          const isUnlocked = stats.wins >= tier.wins;
          const isClaimed = claimedTiers.includes(tier.tier);
          const Icon = tier.icon;
          const progress = Math.min((stats.wins / tier.wins) * 100, 100);
          
          return (
            <div 
              key={tier.tier}
              className={`p-3 border rounded-lg ${
                isUnlocked ? 'border-primary bg-primary/5' : 'border-border opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-semibold">{tier.reward}</span>
                </div>
                <Badge variant={isUnlocked ? 'default' : 'outline'} className="text-xs">
                  {tier.wins} wins
                </Badge>
              </div>
              
              {!isClaimed && (
                <>
                  <Progress value={progress} className="h-1 mb-2" />
                  {isUnlocked && (
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => onClaimReward(tier.tier)}
                    >
                      Claim Reward
                    </Button>
                  )}
                </>
              )}
              
              {isClaimed && (
                <Badge variant="secondary" className="w-full justify-center">
                  ✓ Claimed
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};