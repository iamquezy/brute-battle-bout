import { useState, useEffect } from 'react';
import { Character } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  canPrestige,
  performPrestige,
  getPrestigeRecord,
  calculatePrestigeBonuses,
  PRESTIGE_REQUIREMENTS,
  PrestigeRecord
} from '@/lib/prestigeSystem';
import { Sparkles, TrendingUp, Shield, Heart, Coins, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface PrestigeModalProps {
  open: boolean;
  onClose: () => void;
  player: Character;
  userId: string;
  onPrestige: () => void;
}

export function PrestigeModal({ open, onClose, player, userId, onPrestige }: PrestigeModalProps) {
  const [prestigeRecord, setPrestigeRecord] = useState<PrestigeRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPrestigeData();
    }
  }, [open, userId]);

  const loadPrestigeData = async () => {
    const data = await getPrestigeRecord(userId);
    setPrestigeRecord(data);
  };

  const { canPrestige: eligible, reason } = canPrestige(player, player.gold);
  const currentPrestigeLevel = prestigeRecord?.prestige_level || 0;
  const nextPrestigeLevel = currentPrestigeLevel + 1;
  const nextBonuses = calculatePrestigeBonuses(nextPrestigeLevel);

  const handlePrestige = async () => {
    if (!eligible) {
      toast.error(reason);
      return;
    }

    setLoading(true);
    const result = await performPrestige(userId, player);
    setLoading(false);

    if (result.success) {
      toast.success(`Prestige ${result.newPrestigeLevel} achieved!`);
      onPrestige();
      onClose();
    } else {
      toast.error(result.error || 'Failed to prestige');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Prestige System
          </DialogTitle>
          <DialogDescription>
            Reset your level for powerful permanent bonuses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Prestige Status */}
          <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-purple-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Current Prestige Level</span>
              <Badge variant="outline" className="text-lg">
                <Sparkles className="h-4 w-4 mr-1" />
                {currentPrestigeLevel}
              </Badge>
            </div>
            {prestigeRecord && (
              <div className="text-sm text-muted-foreground">
                Total Prestiges: {prestigeRecord.total_prestiges}
                {prestigeRecord.last_prestige_at && (
                  <span className="ml-2">
                    • Last: {new Date(prestigeRecord.last_prestige_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h3 className="font-semibold mb-3">Requirements to Prestige</h3>
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-2 rounded ${player.level >= PRESTIGE_REQUIREMENTS.minLevel ? 'bg-green-500/10' : 'bg-muted'}`}>
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Level {PRESTIGE_REQUIREMENTS.minLevel}
                </span>
                <Badge variant={player.level >= PRESTIGE_REQUIREMENTS.minLevel ? 'default' : 'outline'}>
                  {player.level >= PRESTIGE_REQUIREMENTS.minLevel ? '✓' : `${player.level}/${PRESTIGE_REQUIREMENTS.minLevel}`}
                </Badge>
              </div>
              <div className={`flex items-center justify-between p-2 rounded ${player.gold >= PRESTIGE_REQUIREMENTS.goldCost ? 'bg-green-500/10' : 'bg-muted'}`}>
                <span className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  {PRESTIGE_REQUIREMENTS.goldCost} Gold
                </span>
                <Badge variant={player.gold >= PRESTIGE_REQUIREMENTS.goldCost ? 'default' : 'outline'}>
                  {player.gold >= PRESTIGE_REQUIREMENTS.goldCost ? '✓' : `${player.gold}/${PRESTIGE_REQUIREMENTS.goldCost}`}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Next Level Bonuses */}
          <div>
            <h3 className="font-semibold mb-3">Prestige {nextPrestigeLevel} Bonuses (Permanent)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Attack Bonus</span>
                </div>
                <div className="text-2xl font-bold">+{nextBonuses.attackBonus}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Defense Bonus</span>
                </div>
                <div className="text-2xl font-bold">+{nextBonuses.defenseBonus}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Health Bonus</span>
                </div>
                <div className="text-2xl font-bold">+{nextBonuses.healthBonus}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Gold Multiplier</span>
                </div>
                <div className="text-2xl font-bold">×{nextBonuses.goldMultiplier.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-destructive mb-1">Warning</div>
                <p className="text-sm text-muted-foreground">
                  Prestiging will reset your character to level 1, remove all equipment and inventory items, 
                  and cost {PRESTIGE_REQUIREMENTS.goldCost} gold. However, you will keep your permanent prestige bonuses, 
                  cosmetics, and achievements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handlePrestige} 
            disabled={!eligible || loading}
            className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Prestiging...' : `Prestige to Level ${nextPrestigeLevel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
