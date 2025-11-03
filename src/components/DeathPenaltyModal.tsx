import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skull, Coins, Shield } from 'lucide-react';
import { Equipment } from '@/types/equipment';

interface DeathPenaltyModalProps {
  open: boolean;
  onClose: () => void;
  goldLost: number;
  itemLost: Equipment | null;
  isPvP?: boolean;
}

export function DeathPenaltyModal({ open, onClose, goldLost, itemLost, isPvP = false }: DeathPenaltyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 justify-center text-destructive">
            <Skull className="h-6 w-6" />
            DEFEATED!
          </DialogTitle>
          <DialogDescription className="text-center">
            {isPvP ? 'You fell in battle. Your opponent claims their prize.' : 'You have fallen in combat.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-destructive/10 border-destructive/30">
            <h3 className="font-semibold mb-3 text-center">Losses</h3>
            <div className="space-y-3">
              {goldLost > 0 && (
                <div className="flex items-center justify-between p-2 bg-background rounded">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-destructive" />
                    <span>Gold Lost</span>
                  </div>
                  <span className="font-bold text-destructive">-{goldLost}g</span>
                </div>
              )}

              {itemLost && (
                <div className="flex items-center justify-between p-2 bg-background rounded">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span>Item Lost</span>
                  </div>
                  <span className="font-bold text-destructive capitalize">
                    {itemLost.name}
                  </span>
                </div>
              )}

              {goldLost === 0 && !itemLost && (
                <div className="text-center text-muted-foreground py-2">
                  No significant losses
                </div>
              )}
            </div>
          </Card>

          {isPvP && (goldLost > 0 || itemLost) && (
            <div className="text-center text-sm text-muted-foreground">
              Your opponent has claimed your {itemLost ? 'equipment' : 'gold'}
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground bg-secondary/50 p-3 rounded">
            💡 Tip: Purchase Insurance (500g) from the shop to protect against item loss once
          </div>

          <Button onClick={onClose} className="w-full bg-gradient-gold">
            Return to Hub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
