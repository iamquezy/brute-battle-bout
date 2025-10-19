import { Equipment, EquipmentSlots } from '@/types/equipment';
import { Button } from './ui/button';
import { Card } from './ui/card';
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
  common: 'text-gray-400 border-gray-400/30',
  uncommon: 'text-green-400 border-green-400/30',
  rare: 'text-blue-400 border-blue-400/30',
  epic: 'text-purple-400 border-purple-400/30',
  legendary: 'text-amber-400 border-amber-400/30',
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {inventory.map((item) => {
                  const Icon = TYPE_ICONS[item.type];
                  const isEquipped = equippedItems[item.type]?.id === item.id;
                  
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        'p-3 border-2 transition-all hover:scale-105',
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
