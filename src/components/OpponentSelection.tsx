import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PRE_MADE_OPPONENTS } from '@/types/opponents';
import { Sword, Wand2, Target, Shield, Zap, Heart, TrendingUp, TrendingDown } from 'lucide-react';

interface OpponentSelectionProps {
  playerLevel: number;
  onSelectOpponent: (opponentId: string) => void;
  onCancel: () => void;
}

const CLASS_ICONS = {
  fighter: Sword,
  mage: Wand2,
  archer: Target,
};

const CLASS_BASE_STATS = {
  fighter: { attack: 15, defense: 12, speed: 8, health: 120 },
  mage: { attack: 20, defense: 6, speed: 10, health: 80 },
  archer: { attack: 18, defense: 8, speed: 14, health: 100 },
};

const getClassGradient = (cls: 'fighter' | 'mage' | 'archer') => {
  switch (cls) {
    case 'fighter': return 'bg-gradient-fighter';
    case 'mage': return 'bg-gradient-mage';
    case 'archer': return 'bg-gradient-archer';
  }
};

const StatComparison = ({ value, label }: { value: number; label: string }) => {
  const isHigh = value >= 1.05;
  const isLow = value <= 0.95;
  
  return (
    <div className="flex items-center gap-1">
      {isHigh && <TrendingUp className="w-3 h-3 text-destructive" />}
      {isLow && <TrendingDown className="w-3 h-3 text-green-400" />}
      <span className={isHigh ? 'text-destructive font-bold' : isLow ? 'text-green-400 font-bold' : ''}>
        {label}
      </span>
    </div>
  );
};

export function OpponentSelection({ playerLevel, onSelectOpponent, onCancel }: OpponentSelectionProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);

  const calculateStats = (opponent: typeof PRE_MADE_OPPONENTS[0]) => {
    const baseStats = CLASS_BASE_STATS[opponent.class];
    const levelMultiplier = 1 + (playerLevel - 1) * 0.12;
    
    return {
      health: Math.floor(baseStats.health * levelMultiplier * 0.95 * opponent.statModifiers.healthMod),
      attack: Math.floor(baseStats.attack * levelMultiplier * 0.90 * opponent.statModifiers.attackMod),
      defense: Math.floor(baseStats.defense * levelMultiplier * 0.90 * opponent.statModifiers.defenseMod),
      speed: Math.floor(baseStats.speed * levelMultiplier * opponent.statModifiers.speedMod),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-arena flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
            Choose Your Opponent
          </h1>
          <p className="text-muted-foreground text-lg">Select your challenger wisely</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {PRE_MADE_OPPONENTS.map((opponent) => {
            const Icon = CLASS_ICONS[opponent.class];
            const stats = calculateStats(opponent);
            const isSelected = selectedOpponent === opponent.id;
            
            return (
              <Card
                key={opponent.id}
                className={`
                  p-6 cursor-pointer transition-all duration-300 border-2
                  ${isSelected 
                    ? 'border-destructive shadow-glow shadow-destructive scale-105' 
                    : 'border-border hover:border-destructive/50 hover:scale-102'
                  }
                `}
                onClick={() => setSelectedOpponent(opponent.id)}
              >
                <div className="flex flex-col gap-4">
                  <div className={`
                    w-24 h-24 mx-auto rounded-full ${getClassGradient(opponent.class)} 
                    flex items-center justify-center animate-glow-pulse border-2 border-destructive/30
                  `}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {opponent.name}
                    </h3>
                    <p className="text-sm text-destructive font-semibold mb-2">
                      {opponent.title}
                    </p>
                    <p className="text-sm text-muted-foreground italic mb-3">
                      {opponent.description}
                    </p>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <StatComparison 
                        value={opponent.statModifiers.attackMod} 
                        label="Attack" 
                      />
                      <span className="font-bold">{stats.attack}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <StatComparison 
                        value={opponent.statModifiers.defenseMod} 
                        label="Defense" 
                      />
                      <span className="font-bold">{stats.defense}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <StatComparison 
                        value={opponent.statModifiers.speedMod} 
                        label="Speed" 
                      />
                      <span className="font-bold">{stats.speed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <StatComparison 
                        value={opponent.statModifiers.healthMod} 
                        label="Health" 
                      />
                      <span className="font-bold">{stats.health}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                    Level {playerLevel} {opponent.class}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-12 text-lg"
          >
            Back to Hub
          </Button>
          <Button
            onClick={() => selectedOpponent && onSelectOpponent(selectedOpponent)}
            disabled={!selectedOpponent}
            className="flex-1 h-12 text-lg font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Challenge Selected
          </Button>
        </div>
      </Card>
    </div>
  );
}
