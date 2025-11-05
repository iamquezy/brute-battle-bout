import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Specialization } from '@/types/specialization';
import { CharacterClass } from '@/types/game';
import { getSpecializationsForClass } from '@/lib/specializationData';
import { Sparkles, Zap, Shield, Target } from 'lucide-react';

interface SpecializationModalProps {
  open: boolean;
  onClose: () => void;
  characterClass: CharacterClass;
  currentLevel: number;
  currentSpecialization: string | null;
  onSelectSpecialization: (specializationId: string) => void;
}

export const SpecializationModal = ({
  open,
  onClose,
  characterClass,
  currentLevel,
  currentSpecialization,
  onSelectSpecialization,
}: SpecializationModalProps) => {
  const availableSpecs = getSpecializationsForClass(characterClass);

  const renderBonuses = (bonuses: Specialization['bonuses']) => {
    return Object.entries(bonuses).map(([stat, value]) => {
      if (!value) return null;
      const isPositive = value > 0;
      const color = isPositive ? 'text-green-400' : 'text-red-400';
      const sign = isPositive ? '+' : '';
      
      return (
        <div key={stat} className={`text-sm ${color}`}>
          {sign}{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
        </div>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Choose Your Specialization
          </DialogTitle>
          <p className="text-muted-foreground">
            Unlock at level 10. Specializations grant unique bonuses and abilities.
          </p>
        </DialogHeader>

        {currentLevel < 10 && (
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
            <p className="text-sm text-yellow-500">
              ⚠️ You need to reach level 10 to choose a specialization. Current level: {currentLevel}
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {availableSpecs.map((spec) => {
            const isSelected = currentSpecialization === spec.id;
            const canSelect = currentLevel >= spec.requiredLevel && !currentSpecialization;
            
            return (
              <Card
                key={spec.id}
                className={`p-4 transition-all ${
                  isSelected
                    ? 'border-primary border-2 bg-primary/10'
                    : canSelect
                    ? 'hover:border-primary/50 cursor-pointer'
                    : 'opacity-60'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{spec.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{spec.name}</h3>
                  <Badge variant={isSelected ? 'default' : 'outline'} className="mb-2">
                    Level {spec.requiredLevel}+
                  </Badge>
                  <p className="text-sm text-muted-foreground">{spec.description}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> Stat Bonuses
                    </h4>
                    <div className="space-y-1">
                      {renderBonuses(spec.bonuses)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" /> Unique Ability
                    </h4>
                    <div className="p-2 bg-secondary/50 rounded">
                      <p className="text-sm font-semibold text-primary">
                        {spec.uniqueAbility.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {spec.uniqueAbility.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cooldown: {spec.uniqueAbility.cooldown} turns
                      </p>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Badge className="w-full justify-center bg-green-500">
                    ✓ Selected
                  </Badge>
                )}

                {!isSelected && canSelect && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      onSelectSpecialization(spec.id);
                      onClose();
                    }}
                  >
                    Choose {spec.name}
                  </Button>
                )}

                {!canSelect && !isSelected && (
                  <Button className="w-full" disabled>
                    {currentSpecialization ? 'Already Specialized' : 'Locked'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        {currentSpecialization && (
          <Card className="p-4 bg-primary/10 border-primary/30 mt-4">
            <p className="text-sm text-center">
              <Shield className="w-4 h-4 inline mr-1" />
              Once chosen, specializations are permanent! Choose wisely.
            </p>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};