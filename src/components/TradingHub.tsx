import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Send, ShoppingCart, Package, Coins, Check, X, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Equipment, Rarity } from '@/types/equipment';

interface TradingHubProps {
  userId: string;
  player: any;
  inventory: Equipment[];
  gold: number;
  onBack: () => void;
  onGoldChange: (amount: number) => void;
  onInventoryChange: (items: Equipment[]) => void;
}

interface TradeRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_items: Equipment[];
  receiver_items: Equipment[];
  sender_gold: number;
  receiver_gold: number;
  status: string;
  message: string;
  created_at: string;
  sender?: { username: string };
  receiver?: { username: string };
}

interface MarketplaceListing {
  id: string;
  seller_id: string;
  item_data: Equipment;
  price: number;
  status: string;
  created_at: string;
  seller?: { username: string };
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'bg-muted text-muted-foreground',
  uncommon: 'bg-green-500/20 text-green-400 border-green-500/50',
  rare: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  epic: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  legendary: 'bg-gold/20 text-gold border-gold/50',
};

export function TradingHub({ 
  userId, 
  player, 
  inventory, 
  gold, 
  onBack, 
  onGoldChange, 
  onInventoryChange 
}: TradingHubProps) {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadListings(), loadMyListings(), loadTradeRequests()]);
    setLoading(false);
  };

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .neq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const withSellers = await Promise.all(
        (data || []).map(async (listing) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', listing.seller_id)
            .single();
          return { 
            ...listing, 
            seller: profile,
            item_data: listing.item_data as unknown as Equipment
          };
        })
      );

      setListings(withSellers);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const loadMyListings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('seller_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyListings((data || []).map(l => ({
        ...l,
        item_data: l.item_data as unknown as Equipment
      })));
    } catch (error) {
      console.error('Error loading my listings:', error);
    }
  };

  const loadTradeRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_requests')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const withUsers = await Promise.all(
        (data || []).map(async (trade) => {
          const [senderRes, receiverRes] = await Promise.all([
            supabase.from('profiles').select('username').eq('id', trade.sender_id).single(),
            supabase.from('profiles').select('username').eq('id', trade.receiver_id).single(),
          ]);
          return { 
            ...trade, 
            sender: senderRes.data,
            receiver: receiverRes.data,
            sender_items: trade.sender_items as unknown as Equipment[],
            receiver_items: trade.receiver_items as unknown as Equipment[],
          };
        })
      );

      setTradeRequests(withUsers);
    } catch (error) {
      console.error('Error loading trade requests:', error);
    }
  };

  const handleListItem = async () => {
    if (!selectedItem || !listingPrice) return;

    const price = parseInt(listingPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert([{
          seller_id: userId,
          item_data: JSON.parse(JSON.stringify(selectedItem)),
          price,
          status: 'active',
        }]);

      if (error) throw error;

      // Remove item from inventory
      const newInventory = inventory.filter(i => i.id !== selectedItem.id);
      onInventoryChange(newInventory);

      toast.success('Item listed on marketplace!');
      setSelectedItem(null);
      setListingPrice('');
      loadMyListings();
    } catch (error) {
      console.error('Error listing item:', error);
      toast.error('Failed to list item');
    }
  };

  const handleBuyItem = async (listing: MarketplaceListing) => {
    if (gold < listing.price) {
      toast.error('Not enough gold!');
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({
          status: 'sold',
          buyer_id: userId,
          sold_at: new Date().toISOString(),
        })
        .eq('id', listing.id);

      if (error) throw error;

      // Add item to inventory
      onInventoryChange([...inventory, listing.item_data]);
      onGoldChange(gold - listing.price);

      toast.success(`Purchased ${listing.item_data.name}!`);
      loadListings();
    } catch (error) {
      console.error('Error buying item:', error);
      toast.error('Failed to purchase item');
    }
  };

  const handleCancelListing = async (listingId: string, item: Equipment) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'cancelled' })
        .eq('id', listingId);

      if (error) throw error;

      // Return item to inventory
      onInventoryChange([...inventory, item]);

      toast.success('Listing cancelled');
      loadMyListings();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast.error('Failed to cancel listing');
    }
  };

  const handleTradeResponse = async (tradeId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('trade_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', tradeId);

      if (error) throw error;

      toast.success(accept ? 'Trade accepted!' : 'Trade rejected');
      loadTradeRequests();
    } catch (error) {
      console.error('Error responding to trade:', error);
      toast.error('Failed to respond to trade');
    }
  };

  const filteredListings = listings.filter(l => 
    l.item_data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.item_data.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-gold" />
                  Trading Hub
                </CardTitle>
                <CardDescription>Buy, sell, and trade items with other players</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Coins className="h-4 w-4 mr-2 text-gold" />
                {gold.toLocaleString()} Gold
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="my-listings">My Listings</TabsTrigger>
                <TabsTrigger value="trades">Trade Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="marketplace" className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <ScrollArea className="h-[500px]">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : filteredListings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No items available
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredListings.map((listing) => (
                        <Card key={listing.id} className="bg-card/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{listing.item_data.name}</h4>
                                <Badge className={RARITY_COLORS[listing.item_data.rarity]}>
                                  {listing.item_data.rarity}
                                </Badge>
                              </div>
                              <Badge variant="outline" className="text-gold">
                                <Coins className="h-3 w-3 mr-1" />
                                {listing.price.toLocaleString()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              Seller: {listing.seller?.username || 'Unknown'}
                            </p>
                            <div className="text-xs space-y-1 mb-3">
                              {Object.entries(listing.item_data.stats).map(([stat, value]) => (
                                <div key={stat} className="flex justify-between">
                                  <span className="capitalize">{stat}</span>
                                  <span className="text-primary">+{value}</span>
                                </div>
                              ))}
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleBuyItem(listing)}
                              disabled={gold < listing.price}
                            >
                              Buy Now
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="my-listings" className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      List New Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>List Item for Sale</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <ScrollArea className="h-[200px] border rounded-lg p-2">
                        {inventory.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            No items to list
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {inventory.map((item) => (
                              <div
                                key={item.id}
                                className={`p-2 rounded cursor-pointer border transition-colors ${
                                  selectedItem?.id === item.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent hover:bg-muted/50'
                                }`}
                                onClick={() => setSelectedItem(item)}
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">{item.name}</span>
                                  <Badge className={RARITY_COLORS[item.rarity]}>
                                    {item.rarity}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                      {selectedItem && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price (Gold)</label>
                          <Input
                            type="number"
                            placeholder="Enter price..."
                            value={listingPrice}
                            onChange={(e) => setListingPrice(e.target.value)}
                          />
                          <Button className="w-full" onClick={handleListItem}>
                            List for Sale
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <ScrollArea className="h-[400px]">
                  {myListings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      You have no active listings
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {myListings.map((listing) => (
                        <Card key={listing.id} className="bg-card/50">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{listing.item_data.name}</h4>
                              <Badge className={RARITY_COLORS[listing.item_data.rarity]}>
                                {listing.item_data.rarity}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-gold">
                                <Coins className="h-3 w-3 mr-1" />
                                {listing.price.toLocaleString()}
                              </Badge>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelListing(listing.id, listing.item_data)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="trades" className="space-y-4">
                <ScrollArea className="h-[500px]">
                  {tradeRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending trade requests
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tradeRequests.map((trade) => (
                        <Card key={trade.id} className="bg-card/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-medium">
                                  {trade.sender_id === userId ? 'To' : 'From'}:{' '}
                                  {trade.sender_id === userId
                                    ? trade.receiver?.username
                                    : trade.sender?.username}
                                </p>
                                {trade.message && (
                                  <p className="text-sm text-muted-foreground">{trade.message}</p>
                                )}
                              </div>
                              <Badge>Pending</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-muted-foreground mb-1">Their Offer:</p>
                                <div className="space-y-1">
                                  {trade.sender_items.map((item, i) => (
                                    <Badge key={i} variant="outline" className="mr-1">
                                      {item.name}
                                    </Badge>
                                  ))}
                                  {trade.sender_gold > 0 && (
                                    <Badge variant="outline" className="text-gold">
                                      +{trade.sender_gold} Gold
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">For:</p>
                                <div className="space-y-1">
                                  {trade.receiver_items.map((item, i) => (
                                    <Badge key={i} variant="outline" className="mr-1">
                                      {item.name}
                                    </Badge>
                                  ))}
                                  {trade.receiver_gold > 0 && (
                                    <Badge variant="outline" className="text-gold">
                                      +{trade.receiver_gold} Gold
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {trade.receiver_id === userId && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleTradeResponse(trade.id, true)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => handleTradeResponse(trade.id, false)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
