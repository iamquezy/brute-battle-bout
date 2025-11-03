import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClassEvolutionPath, EVOLUTION_REQUIREMENTS } from '@/lib/classEvolution';
import { Swords, Shield, Zap, Heart, Star, Trophy, Target } from 'lucide-react';

interface ClassEvolutionModalProps {
  open: boolean;
  onClose: () => void;
  availableEvolutions: ClassEvolutionPath[];
  currentTier: number;
  playerGold: number;
  onChooseEvolution: (evolution: ClassEvolutionPath) => void;
}

export function ClassEvolutionModal({
  open,
  onClose,
  availableEvolutions,
  currentTier,
  playerGold,
  onChooseEvolution
}: ClassEvolutionModalProps) {
  const [selectedEvolution, setSelectedEvolution] = useState<ClassEvolutionPath | null>(null);
  
  const requirements = EVOLUTION_REQUIREMENTS[(currentTier + 1) as 1 | 2 | 3 | 4];
  const canAfford = playerGold >= requirements.gold;

  const handleConfirm = () => {
    if (selectedEvolution && canAfford) {
      onChooseEvolution(selectedEvolution);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-2">
            <Star className="h-8 w-8 text-primary" />
            Class Evolution - Tier {currentTier + 1}
          </DialogTitle>
          <DialogDescription>
            Choose your path and unlock new powers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requirements Display */}
          <Card className="p-4 bg-secondary/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Requirements Met
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Level</div>
                <div className="font-bold text-green-500">✓ {requirements.level}</div>
              </div>
              <div>
                <div className="text-muted-foreground">PvP Wins</div>
                <div className="font-bold text-green-500">✓ {requirements.pvpWins}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Boss Defeats</div>
                <div className="font-bold text-green-500">✓ {requirements.bossDefeats}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Gold Cost</div>
                <div className={`font-bold ${canAfford ? 'text-green-500' : 'text-destructive'}`}>
                  {canAfford ? '✓' : '✗'} {requirements.gold}g
                </div>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Evolution Choices */}
          <div className="grid md:grid-cols-2 gap-4">
            {availableEvolutions.map((evolution) => (
              <Card
                key={evolution.subclass}
                className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                  selectedEvolution?.subclass === evolution.subclass
                    ? 'border-4 border-primary shadow-glow shadow-primary'
                    : 'border-2 border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedEvolution(evolution)}
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className="mb-2">{evolution.name}</Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {evolution.description}
                    </p>
                  </div>

                  {/* Stat Bonuses */}
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    <h4 className="font-semibold text-sm mb-2">Stat Bonuses</h4>
                    {evolution.statBonuses.attack && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Swords className="w-3 h-3 text-primary" />
                          <span>Attack</span>
                        </div>
                        <span className="font-bold text-green-500">+{evolution.statBonuses.attack}</span>
                      </div>
                    )}
                    {evolution.statBonuses.defense && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-primary" />
                          <span>Defense</span>
                        </div>
                        <span className="font-bold text-green-500">+{evolution.statBonuses.defense}</span>
                      </div>
                    )}
                    {evolution.statBonuses.speed && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-primary" />
                          <span>Speed</span>
                        </div>
                        <span className="font-bold text-green-500">+{evolution.statBonuses.speed}</span>
                      </div>
                    )}
                    {evolution.statBonuses.health && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-destructive" />
                          <span>Health</span>
                        </div>
                        <span className="font-bold text-green-500">+{evolution.statBonuses.health}</span>
                      </div>
                    )}
                    {evolution.statBonuses.critChance && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-primary" />
                          <span>Crit Chance</span>
                        </div>
                        <span className="font-bold text-green-500">+{evolution.statBonuses.critChance}%</span>
                      </div>
                    )}
                    {evolution.statBonuses.evasion && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-primary" />
                          <span>Evasion</span>
                        </div>
                        <span className="font-bold text-green-500">+{evolution.statBonuses.evasion}%</span>
                      </div>
                    )}
                  </div>

                  {/* Special Ability */}
                  {evolution.specialAbility && (
                    <div className="bg-primary/10 rounded-lg p-3 border-2 border-primary/30">
                      <h4 className="font-semibold text-sm mb-1 text-primary">Special Ability</h4>
                      <p className="text-xs">{evolution.specialAbility}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Confirm Button */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedEvolution || !canAfford}
              className="bg-gradient-gold"
            >
              {!canAfford ? 'Not Enough Gold' : 'Evolve to ' + (selectedEvolution?.name || '')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
