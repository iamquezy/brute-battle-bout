import { Equipment, EquipmentSlots } from '@/types/equipment';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Sword, Shield, Gem, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryProps {
  inventory: Equipment[];
  equippedItems: EquipmentSlots;
  onEquip: (item: Equipment) => void;
  onUnequip: (slot: keyof EquipmentSlots) => void;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: 'text-gray-500 border-gray-500/30',
  uncommon: 'text-green-500 border-green-500/30',
  rare: 'text-blue-500 border-blue-500/30',
  epic: 'text-purple-500 border-purple-500/30',
  legendary: 'text-yellow-500 border-yellow-500/30',
};

const TYPE_ICONS = {
  weapon: Sword,
  armor: Shield,
  accessory: Gem,
};

export function Inventory({ inventory, equippedItems, onEquip, onUnequip, onClose }: InventoryProps) {
  const getStatDisplay = (stats: Equipment['stats']) => {
    return Object.entries(stats)
      .filter(([_, value]) => value && value > 0)
      .map(([key, value]) => `+${value} ${key}`)
      .join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-card/95 border-2">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-primary">Inventory & Equipment</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Equipped Items */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-foreground">Equipped</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['weapon', 'armor', 'accessory'] as const).map((slot) => {
                const item = equippedItems[slot];
                const Icon = TYPE_ICONS[slot];
                
                return (
                  <div key={slot} className="border-2 border-border rounded-lg p-4 bg-secondary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-bold capitalize text-foreground">{slot}</span>
                    </div>
                    {item ? (
                      <div>
                        <p className={cn('font-bold mb-1', RARITY_COLORS[item.rarity])}>
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getStatDisplay(item.stats)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUnequip(slot)}
                          className="w-full"
                        >
                          Unequip
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Empty slot</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory Items */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">
              Inventory ({inventory.length} items)
            </h3>
            {inventory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No items in inventory. Defeat opponents to find equipment!
              </p>
            ) : (
              <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inventory.map((item) => {
                    const Icon = TYPE_ICONS[item.type];
                    const isEquipped = equippedItems[item.type]?.id === item.id;
                    
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Card
                            className={cn(
                              'p-3 border-2 transition-all hover:scale-105 cursor-pointer',
                              RARITY_COLORS[item.rarity],
                              isEquipped && 'opacity-50'
                            )}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Icon className="h-5 w-5 mt-1" />
                              <div className="flex-1">
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs opacity-75 capitalize">{item.type}</p>
                              </div>
                            </div>
                            <p className="text-sm mb-2">{getStatDisplay(item.stats)}</p>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onEquip(item)}
                              disabled={isEquipped}
                              className="w-full"
                            >
                              {isEquipped ? 'Equipped' : 'Equip'}
                            </Button>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-card border-2 p-3">
                          <div className="space-y-1">
                            <p className={cn('font-bold text-base', RARITY_COLORS[item.rarity])}>
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{item.rarity} {item.type}</p>
                            <div className="pt-2 space-y-1">
                              {Object.entries(item.stats)
                                .filter(([_, value]) => value && value > 0)
                                .map(([key, value]) => (
                                  <p key={key} className="text-sm text-green-400">
                                    +{value} {key}
                                  </p>
                                ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
