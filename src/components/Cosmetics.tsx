import { useState, useEffect } from 'react';
import { Character } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { COSMETIC_ITEMS, CosmeticItem, getPurchasableCosmetics } from '@/lib/cosmeticsData';
import { ArrowLeft, Check, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CosmeticsProps {
  player: Character;
  userId: string;
  onBack: () => void;
  onPurchase: (cost: number) => void;
}

interface OwnedCosmetic {
  id: string;
  item_id: string;
  item_type: string;
  equipped: boolean;
}

export function Cosmetics({ player, userId, onBack, onPurchase }: CosmeticsProps) {
  const [ownedCosmetics, setOwnedCosmetics] = useState<OwnedCosmetic[]>([]);
  const [activeTab, setActiveTab] = useState<'skins' | 'titles' | 'effects' | 'frames'>('skins');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOwnedCosmetics();
  }, [userId]);

  const loadOwnedCosmetics = async () => {
    try {
      const { data, error } = await supabase
        .from('cosmetic_items')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setOwnedCosmetics(data || []);
    } catch (error) {
      console.error('Error loading cosmetics:', error);
    }
  };

  const isOwned = (itemId: string) => {
    return ownedCosmetics.some(c => c.item_id === itemId);
  };

  const isEquipped = (itemId: string) => {
    return ownedCosmetics.some(c => c.item_id === itemId && c.equipped);
  };

  const canUnlock = (item: CosmeticItem): { can: boolean; reason?: string } => {
    if (isOwned(item.id)) {
      return { can: false, reason: 'Already owned' };
    }

    if (item.requirementLevel && player.level < item.requirementLevel) {
      return { can: false, reason: `Requires level ${item.requirementLevel}` };
    }

    if (item.cost && player.gold < item.cost) {
      return { can: false, reason: `Need ${item.cost} gold` };
    }

    if (!item.cost || item.cost === 0) {
      return { can: false, reason: 'Cannot be purchased' };
    }

    return { can: true };
  };

  const handlePurchase = async (item: CosmeticItem) => {
    if (!item.cost) return;

    const check = canUnlock(item);
    if (!check.can) {
      toast.error(check.reason);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cosmetic_items')
        .insert({
          user_id: userId,
          item_id: item.id,
          item_type: item.type,
          equipped: false
        });

      if (error) throw error;

      onPurchase(item.cost);
      toast.success(`Unlocked: ${item.name}`);
      loadOwnedCosmetics();
    } catch (error) {
      console.error('Error purchasing cosmetic:', error);
      toast.error('Failed to purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (itemId: string, itemType: string) => {
    setLoading(true);
    try {
      // Unequip all items of this type
      await supabase
        .from('cosmetic_items')
        .update({ equipped: false })
        .eq('user_id', userId)
        .eq('item_type', itemType);

      // Equip this item
      const { error } = await supabase
        .from('cosmetic_items')
        .update({ equipped: true })
        .eq('user_id', userId)
        .eq('item_id', itemId);

      if (error) throw error;

      toast.success('Cosmetic equipped!');
      loadOwnedCosmetics();
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
      toast.error('Failed to equip');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-slate-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return '';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'outline';
      case 'rare': return 'secondary';
      case 'epic': return 'default';
      case 'legendary': return 'default';
      default: return 'outline';
    }
  };

  const renderCosmeticCard = (item: CosmeticItem) => {
    const owned = isOwned(item.id);
    const equipped = isEquipped(item.id);
    const check = canUnlock(item);

    return (
      <Card key={item.id} className={equipped ? 'border-primary' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className={`flex items-center gap-2 ${getRarityColor(item.rarity)}`}>
                {item.name}
                {equipped && <Check className="h-5 w-5 text-primary" />}
              </CardTitle>
              <CardDescription className="mt-1">{item.description}</CardDescription>
            </div>
            <Badge variant={getRarityBadge(item.rarity)} className={getRarityColor(item.rarity)}>
              {item.rarity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {item.unlockMethod}
            </div>

            {owned ? (
              <Button 
                onClick={() => handleEquip(item.id, item.type)}
                disabled={equipped || loading}
                className="w-full"
                variant={equipped ? 'outline' : 'default'}
              >
                {equipped ? 'Equipped' : 'Equip'}
              </Button>
            ) : (
              <div className="space-y-2">
                {item.cost && item.cost > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span>Cost:</span>
                      <span className="font-bold text-yellow-500">{item.cost} Gold</span>
                    </div>
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={!check.can || loading}
                      className="w-full"
                    >
                      {check.can ? 'Purchase' : check.reason}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    {item.unlockMethod}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredItems = COSMETIC_ITEMS.filter(item => {
    switch (activeTab) {
      case 'skins': return item.type === 'skin';
      case 'titles': return item.type === 'title';
      case 'effects': return item.type === 'effect';
      case 'frames': return item.type === 'avatar_frame';
      default: return false;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hub
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-500" />
              Cosmetics Collection
            </CardTitle>
            <CardDescription>
              Customize your character's appearance
            </CardDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">
                {ownedCosmetics.length} / {COSMETIC_ITEMS.length} Unlocked
              </Badge>
              <Badge variant="outline">
                💰 {player.gold} Gold
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skins">Skins</TabsTrigger>
            <TabsTrigger value="titles">Titles</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="frames">Frames</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <ScrollArea className="h-[600px]">
              <div className="grid md:grid-cols-2 gap-4">
                {filteredItems.map(renderCosmeticCard)}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
