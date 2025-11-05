import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WinStreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

const STREAK_MILESTONES = [3, 5, 10, 15, 20, 30, 50];

export const WinStreakDisplay = ({ currentStreak, bestStreak }: WinStreakDisplayProps) => {
  const nextMilestone = STREAK_MILESTONES.find(m => m > currentStreak) || 100;
  const progress = (currentStreak / nextMilestone) * 100;
  
  const getStreakColor = (streak: number) => {
    if (streak >= 50) return 'text-purple-500';
    if (streak >= 30) return 'text-orange-500';
    if (streak >= 20) return 'text-red-500';
    if (streak >= 10) return 'text-yellow-500';
    if (streak >= 5) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 50) return 'LEGENDARY';
    if (streak >= 30) return 'EPIC';
    if (streak >= 20) return 'MASTER';
    if (streak >= 10) return 'VETERAN';
    if (streak >= 5) return 'HOT';
    if (streak >= 3) return 'WARMING UP';
    return '';
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className={`w-6 h-6 ${getStreakColor(currentStreak)} animate-pulse`} />
          <div>
            <p className="text-xs text-muted-foreground">Win Streak</p>
            <p className={`text-3xl font-bold ${getStreakColor(currentStreak)}`}>
              {currentStreak}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Best</span>
          </div>
          <p className="text-xl font-bold text-yellow-500">{bestStreak}</p>
        </div>
      </div>

      {getStreakBadge(currentStreak) && (
        <Badge className="mb-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          {getStreakBadge(currentStreak)}
        </Badge>
      )}

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Next milestone</span>
          <span className="font-bold">{nextMilestone} wins</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {currentStreak >= 3 && (
        <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-center">
          <span className="text-green-400 font-bold">+{Math.floor(currentStreak / 3) * 10}% Bonus Gold</span>
        </div>
      )}
    </Card>
  );
};