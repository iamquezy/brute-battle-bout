import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Equipment } from '@/types/equipment';
import { CraftingMaterials } from '@/types/crafting';
import { Hammer, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface CraftingProps {
  open: boolean;
  onClose: () => void;
  inventory: Equipment[];
  materials: CraftingMaterials;
  onDismantle: (itemId: string) => void;
  onUpgrade: (itemId: string) => void;
  onReforge: (itemId: string) => void;
  onEnchant: (itemId: string) => void;
}

export const Crafting = ({ 
  open, 
  onClose, 
  inventory,
  materials,
  onDismantle,
  onUpgrade,
  onReforge,
  onEnchant
}: CraftingProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Hammer className="w-8 h-8 text-primary" />
            Crafting
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <span className="text-sm">Materials:</span>
          <span className="text-sm font-bold">{materials.common_shard} Common</span>
          <span className="text-sm font-bold">{materials.uncommon_shard} Uncommon</span>
          <span className="text-sm font-bold">{materials.rare_shard} Rare</span>
          <span className="text-sm font-bold">{materials.epic_shard} Epic</span>
          <span className="text-sm font-bold">{materials.legendary_shard} Legendary</span>
        </div>
        
        <Tabs defaultValue="dismantle" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dismantle"><Hammer className="w-4 h-4 mr-1" />Dismantle</TabsTrigger>
            <TabsTrigger value="upgrade"><Sparkles className="w-4 h-4 mr-1" />Upgrade</TabsTrigger>
            <TabsTrigger value="reforge"><RefreshCw className="w-4 h-4 mr-1" />Reforge</TabsTrigger>
            <TabsTrigger value="enchant"><Zap className="w-4 h-4 mr-1" />Enchant</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dismantle" className="flex-1 overflow-y-auto space-y-2 pr-2">
            {inventory.map(item => (
              <Card key={item.id} className="p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">({item.rarity})</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => onDismantle(item.id)}>
                  Dismantle
                </Button>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="upgrade" className="flex-1 overflow-y-auto space-y-2 pr-2">
            {inventory.filter(i => i.rarity !== 'legendary').map(item => (
              <Card key={item.id} className="p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">({item.rarity})</span>
                </div>
                <Button size="sm" onClick={() => onUpgrade(item.id)}>Upgrade</Button>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="reforge" className="flex-1 overflow-y-auto space-y-2 pr-2">
            {inventory.map(item => (
              <Card key={item.id} className="p-3 flex justify-between items-center">
                <span className="font-bold">{item.name}</span>
                <Button size="sm" onClick={() => onReforge(item.id)}>Reforge</Button>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="enchant" className="flex-1 overflow-y-auto space-y-2 pr-2">
            {inventory.map(item => (
              <Card key={item.id} className="p-3 flex justify-between items-center">
                <span className="font-bold">{item.name}</span>
                <Button size="sm" onClick={() => onEnchant(item.id)}>Enchant</Button>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
