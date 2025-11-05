import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Equipment } from '@/types/equipment';
import { CraftingMaterials } from '@/types/crafting';
import { 
  canEnhance, 
  ENHANCEMENT_COSTS, 
  ENHANCEMENT_SUCCESS_RATES,
  MAX_ENHANCEMENT_LEVEL,
  getEnhancementGlow 
} from '@/lib/enhancementSystem';
import { Sparkles, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { useState } from 'react';

interface EquipmentEnhancementProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  playerGold: number;
  materials: CraftingMaterials;
  onEnhance: (equipment: Equipment, useProtection: boolean) => void;
}

export const EquipmentEnhancement = ({
  open,
  onClose,
  equipment,
  playerGold,
  materials,
  onEnhance,
}: EquipmentEnhancementProps) => {
  const [useProtection, setUseProtection] = useState(false);

  if (!equipment) return null;

  const currentLevel = equipment.enhancementLevel || 0;
  const cost = ENHANCEMENT_COSTS[currentLevel];
  const successRate = ENHANCEMENT_SUCCESS_RATES[currentLevel];
  const { canEnhance: canEnhanceItem, reason } = canEnhance(equipment, playerGold, materials);
  const isMaxLevel = currentLevel >= MAX_ENHANCEMENT_LEVEL;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-[hsl(var(--rarity-legendary))]';
      case 'epic': return 'text-[hsl(var(--rarity-epic))]';
      case 'rare': return 'text-[hsl(var(--rarity-rare))]';
      case 'uncommon': return 'text-[hsl(var(--rarity-uncommon))]';
      default: return 'text-[hsl(var(--rarity-common))]';
    }
  };

  const protectionCost = currentLevel >= 6 ? 500 : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Equipment Enhancement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Equipment Display */}
          <Card className={`p-4 ${getEnhancementGlow(currentLevel)}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className={`text-xl font-bold ${getRarityColor(equipment.rarity)}`}>
                  {equipment.name} {currentLevel > 0 && `+${currentLevel}`}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {equipment.type} • {equipment.rarity}
                </p>
              </div>
              <Badge className="text-lg px-3 py-1">
                +{currentLevel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {Object.entries(equipment.stats || {}).map(([stat, value]) => {
                if (!value) return null;
                return (
                  <div key={stat} className="text-sm">
                    <span className="text-muted-foreground capitalize">{stat}: </span>
                    <span className="font-bold text-primary">+{value}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {!isMaxLevel ? (
            <>
              {/* Enhancement Info */}
              <Card className="p-4 bg-secondary/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={successRate} className="w-32 h-2" />
                      <span className="text-sm font-bold">{successRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Next Level</span>
                    <Badge variant="outline">+{currentLevel + 1}</Badge>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Enhancement Cost:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Gold</span>
                        <span className={playerGold >= cost.gold ? 'text-green-400' : 'text-red-400'}>
                          {cost.gold}
                        </span>
                      </div>
                      {cost.materials && Object.entries(cost.materials).map(([mat, amount]) => {
                        const matKey = mat as keyof CraftingMaterials;
                        const hasEnough = materials[matKey] >= amount;
                        return (
                          <div key={mat} className="flex justify-between text-sm">
                            <span className="capitalize">{mat.replace('_', ' ')}</span>
                            <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                              {materials[matKey]} / {amount}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Warning for high levels */}
              {currentLevel >= 6 && (
                <Card className="p-3 bg-red-500/10 border-red-500/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-500">High Risk Enhancement</p>
                      <p className="text-xs text-red-400 mt-1">
                        Failure will <strong>DESTROY</strong> this item! Use protection scroll to prevent destruction.
                      </p>
                      
                      {protectionCost > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="use-protection"
                            checked={useProtection}
                            onChange={(e) => setUseProtection(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="use-protection" className="text-xs flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Use Protection Scroll (-{protectionCost} gold)
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {currentLevel >= 4 && currentLevel < 6 && (
                <Card className="p-3 bg-yellow-500/10 border-yellow-500/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-500">Medium Risk</p>
                      <p className="text-xs text-yellow-400">
                        Failure will downgrade enhancement by 1 level.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => onEnhance(equipment, useProtection)}
                  disabled={!canEnhanceItem || (useProtection && playerGold < protectionCost)}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Enhance to +{currentLevel + 1}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>

              {!canEnhanceItem && reason && (
                <p className="text-sm text-red-500 text-center">{reason}</p>
              )}
            </>
          ) : (
            <Card className="p-6 text-center bg-gradient-to-br from-yellow-500/20 to-purple-500/20 border-yellow-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <p className="text-lg font-bold">Maximum Enhancement Reached!</p>
              <p className="text-sm text-muted-foreground mt-1">
                This equipment has reached its maximum potential.
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};