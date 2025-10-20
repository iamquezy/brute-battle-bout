import { ShopItem, SHOP_ITEMS } from '@/types/shop';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Coins } from 'lucide-react';

interface ShopProps {
  open: boolean;
  onClose: () => void;
  playerGold: number;
  onPurchase: (item: ShopItem) => void;
}

export const Shop = ({ open, onClose, playerGold, onPurchase }: ShopProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Merchant's Shop
          </DialogTitle>
          <DialogDescription className="text-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Your Gold: <span className="font-bold text-primary">{playerGold}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {SHOP_ITEMS.map((item) => {
            const canAfford = playerGold >= item.price;
            
            return (
              <Card key={item.id} className={`p-4 border-2 transition-all ${
                canAfford 
                  ? 'border-primary/50 hover:border-primary hover:shadow-glow' 
                  : 'border-muted opacity-60'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <Coins className="w-4 h-4" />
                        {item.price}
                      </div>
                      <Button
                        onClick={() => onPurchase(item)}
                        disabled={!canAfford}
                        size="sm"
                        className="bg-gradient-gold text-primary-foreground hover:opacity-90"
                      >
                        Purchase
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
