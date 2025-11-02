import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DifficultyTier, DIFFICULTY_TIERS } from '@/lib/gameLogic';
import { Skull, Swords, Flame, Zap } from 'lucide-react';

interface DifficultySelectorProps {
  onSelect: (difficulty: DifficultyTier) => void;
  onCancel: () => void;
}

const DIFFICULTY_ICONS: Record<DifficultyTier, any> = {
  easy: Zap,
  normal: Swords,
  hard: Flame,
  brutal: Skull,
};

const DIFFICULTY_COLORS: Record<DifficultyTier, string> = {
  easy: 'text-green-500',
  normal: 'text-blue-500',
  hard: 'text-orange-500',
  brutal: 'text-red-500',
};

export const DifficultySelector = ({ onSelect, onCancel }: DifficultySelectorProps) => {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Select Battle Difficulty</CardTitle>
          <CardDescription className="text-center">
            Higher difficulty means tougher enemies but better rewards!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(DIFFICULTY_TIERS) as DifficultyTier[]).map((tier) => {
            const config = DIFFICULTY_TIERS[tier];
            const Icon = DIFFICULTY_ICONS[tier];
            
            return (
              <Button
                key={tier}
                onClick={() => onSelect(tier)}
                variant="outline"
                className="w-full h-auto p-4 flex items-start justify-between hover:border-primary"
              >
                <div className="flex items-start gap-3 text-left">
                  <Icon className={`w-6 h-6 mt-1 ${DIFFICULTY_COLORS[tier]}`} />
                  <div>
                    <div className="font-bold text-lg">{config.name}</div>
                    <div className="text-sm text-muted-foreground">{config.description}</div>
                    <div className="text-xs mt-1 space-x-3">
                      <span className="text-yellow-500">Gold: +{Math.round((config.goldBonus - 1) * 100)}%</span>
                      <span className="text-blue-500">XP: +{Math.round((config.expBonus - 1) * 100)}%</span>
                      <span className={DIFFICULTY_COLORS[tier]}>
                        Enemy: {Math.round(config.multiplier * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
          
          <Button onClick={onCancel} variant="ghost" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
