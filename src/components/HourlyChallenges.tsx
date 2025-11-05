import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Trophy } from 'lucide-react';
import { HourlyChallenge, getTimeRemaining } from '@/lib/hourlyChallenges';
import { useEffect, useState } from 'react';

interface HourlyChallengesProps {
  challenges: HourlyChallenge[];
  onClaim: (challengeId: string) => void;
}

export const HourlyChallenges = ({ challenges, onClaim }: HourlyChallengesProps) => {
  const [, setTick] = useState(0);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (challenges.length === 0) return null;

  return (
    <Card className="p-4 space-y-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          Hourly Challenges
        </h3>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getTimeRemaining(challenges[0]?.expiresAt || Date.now())}
        </Badge>
      </div>

      <div className="space-y-2">
        {challenges.map(challenge => {
          const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
          const isExpired = challenge.expiresAt <= Date.now();
          
          return (
            <div 
              key={challenge.id}
              className={`p-3 border rounded-lg ${
                challenge.completed ? 'border-green-500 bg-green-500/5' : 
                isExpired ? 'border-red-500/30 opacity-50' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    {challenge.name}
                    {challenge.completed && !challenge.claimed && (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
                
                <Badge variant={challenge.completed ? 'default' : 'outline'} className="text-xs ml-2">
                  {challenge.progress}/{challenge.target}
                </Badge>
              </div>

              {!challenge.claimed && !isExpired && (
                <Progress value={progressPercent} className="h-1 mb-2" />
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {challenge.reward.gold && `${challenge.reward.gold} Gold`}
                  {challenge.reward.item && ` • ${challenge.reward.item} Item`}
                  {challenge.reward.exp && ` • ${challenge.reward.exp} XP`}
                </div>
                
                {challenge.completed && !challenge.claimed && (
                  <Button size="sm" onClick={() => onClaim(challenge.id)}>
                    Claim
                  </Button>
                )}
                
                {challenge.claimed && (
                  <Badge variant="secondary" className="text-xs">✓ Claimed</Badge>
                )}
                
                {isExpired && !challenge.completed && (
                  <Badge variant="destructive" className="text-xs">Expired</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};