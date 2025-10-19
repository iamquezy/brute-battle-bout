import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LevelUpChoice, StatType } from '@/types/game';
import { TrendingUp, Heart, Shield, Zap } from 'lucide-react';

interface LevelUpModalProps {
  open: boolean;
  level: number;
  onChooseStat: (stat: StatType) => void;
}

const STAT_CHOICES: LevelUpChoice[] = [
  {
    stat: 'attack',
    label: 'Attack',
    description: 'Increase damage dealt',
    increase: 3,
  },
  {
    stat: 'defense',
    label: 'Defense',
    description: 'Reduce damage taken',
    increase: 3,
  },
  {
    stat: 'speed',
    label: 'Speed',
    description: 'Strike first more often',
    increase: 3,
  },
  {
    stat: 'health',
    label: 'Max Health',
    description: 'Survive longer battles',
    increase: 15,
  },
];

const STAT_ICONS: Record<StatType, any> = {
  attack: TrendingUp,
  defense: Shield,
  speed: Zap,
  health: Heart,
};

export function LevelUpModal({ open, level, onChooseStat }: LevelUpModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl bg-card border-2 border-primary shadow-combat">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent animate-level-up">
                Level {level}!
              </div>
            </div>
            <p className="text-lg text-muted-foreground font-normal">
              Choose a stat to improve
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {STAT_CHOICES.map((choice) => {
            const Icon = STAT_ICONS[choice.stat];
            return (
              <Card
                key={choice.stat}
                className="p-4 hover:border-primary transition-all cursor-pointer hover:scale-105"
                onClick={() => onChooseStat(choice.stat)}
              >
                <Button
                  variant="ghost"
                  className="w-full h-auto p-0 hover:bg-transparent"
                  asChild
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-foreground">{choice.label}</h3>
                      <p className="text-sm text-muted-foreground">{choice.description}</p>
                      <p className="text-primary font-bold mt-1">+{choice.increase}</p>
                    </div>
                  </div>
                </Button>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
