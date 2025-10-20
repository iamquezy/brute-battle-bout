import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pet, PetRarity, PET_LEVEL_REQUIREMENT } from '@/types/pets';
import { Sparkles, Heart, CheckCircle2 } from 'lucide-react';

interface PetsProps {
  open: boolean;
  onClose: () => void;
  pets: Pet[];
  activePet: Pet | null;
  onEquipPet: (petId: string) => void;
  onUnequipPet: () => void;
}

const getRarityColor = (rarity: PetRarity) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    case 'rare': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    case 'epic': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
    case 'legendary': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
  }
};

const formatBonuses = (bonuses: Pet['bonuses']) => {
  const parts: string[] = [];
  
  if (bonuses.attack) parts.push(`+${bonuses.attack} ATK`);
  if (bonuses.defense) parts.push(`+${bonuses.defense} DEF`);
  if (bonuses.speed) parts.push(`+${bonuses.speed} SPD`);
  if (bonuses.health) parts.push(`+${bonuses.health} HP`);
  if (bonuses.evasion) parts.push(`+${bonuses.evasion}% EVA`);
  if (bonuses.critChance) parts.push(`+${bonuses.critChance}% CRIT`);
  if (bonuses.luck) parts.push(`+${bonuses.luck} LUCK`);
  if (bonuses.expMultiplier) parts.push(`x${bonuses.expMultiplier} EXP`);
  if (bonuses.reviveOnce) parts.push('Revive Once');
  
  return parts.join(', ');
};

export const Pets = ({ 
  open, 
  onClose, 
  pets,
  activePet,
  onEquipPet,
  onUnequipPet
}: PetsProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Companions ({pets.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Active Pet Section */}
          <div>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Active Companion
            </h3>
            {activePet ? (
              <Card className={`p-4 ${getRarityColor(activePet.rarity)} border-2`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{activePet.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{activePet.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {activePet.rarity}
                        </Badge>
                        <span className="text-sm font-bold">Lv. {activePet.level}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activePet.description}
                      </p>
                      <div className="text-sm font-bold mb-2">
                        {formatBonuses(activePet.bonuses)}
                      </div>
                      
                      {/* Pet Experience Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Experience</span>
                          <span className="font-bold">
                            {activePet.experience} / {PET_LEVEL_REQUIREMENT}
                          </span>
                        </div>
                        <Progress 
                          value={(activePet.experience / PET_LEVEL_REQUIREMENT) * 100} 
                          className="h-1"
                        />
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={onUnequipPet}>
                    Unequip
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No companion equipped</p>
              </Card>
            )}
          </div>
          
          {/* All Pets Grid */}
          <div>
            <h3 className="text-lg font-bold mb-2">Collected Companions</h3>
            {pets.length === 0 ? (
              <Card className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Win battles to find companions!
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Companions have a small chance to drop after victories
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pets.map(pet => {
                  const isActive = activePet?.id === pet.id;
                  
                  return (
                    <Card 
                      key={pet.id}
                      className={`p-4 ${getRarityColor(pet.rarity)} ${
                        isActive ? 'border-primary border-2' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{pet.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{pet.name}</h3>
                            <Badge variant="outline" className="text-xs capitalize">
                              {pet.rarity}
                            </Badge>
                            {isActive && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Level {pet.level} • {pet.description}
                          </p>
                          <div className="text-xs font-bold mb-2">
                            {formatBonuses(pet.bonuses)}
                          </div>
                          
                          {!isActive && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onEquipPet(pet.id)}
                              className="w-full"
                            >
                              Equip
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
