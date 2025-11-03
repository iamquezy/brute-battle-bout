import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, ShoppingCart } from 'lucide-react';
import { getPvPTickets, buyTickets, getTicketRefillTime, PvPTickets } from '@/lib/pvpTickets';
import { toast } from 'sonner';

interface PvPTicketsDisplayProps {
  userId: string;
  playerGold: number;
  onBuyTickets: (cost: number) => void;
}

export function PvPTicketsDisplay({ userId, playerGold, onBuyTickets }: PvPTicketsDisplayProps) {
  const [tickets, setTickets] = useState<PvPTickets | null>(null);
  const [refillTime, setRefillTime] = useState({ hours: 0, minutes: 0, canRefill: false });

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [userId]);

  const loadTickets = async () => {
    const data = await getPvPTickets(userId);
    if (data) {
      setTickets(data);
      const time = getTicketRefillTime(data.last_refill);
      setRefillTime(time);
    }
  };

  const handleBuyTickets = async (amount: number, cost: number) => {
    if (playerGold < cost) {
      toast.error('Not enough gold!');
      return;
    }

    const success = await buyTickets(userId, amount, cost);
    if (success) {
      onBuyTickets(cost);
      toast.success(`Bought ${amount} PvP ticket${amount > 1 ? 's' : ''}!`);
      loadTickets();
    } else {
      toast.error('Failed to buy tickets');
    }
  };

  if (!tickets) return null;

  return (
    <Card className="bg-secondary/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">PvP Tickets</div>
              <div className="text-xs text-muted-foreground">
                {refillTime.canRefill ? (
                  'Ready to refill!'
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Next refill in {refillTime.hours}h {refillTime.minutes}m
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-2xl px-4 py-2">
            {tickets.tickets} / 10
          </Badge>
        </div>

        {tickets.tickets < 10 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">Buy More Tickets:</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBuyTickets(1, 100)}
                disabled={playerGold < 100}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                1 Ticket (100g)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBuyTickets(5, 450)}
                disabled={playerGold < 450}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                5 Tickets (450g)
              </Button>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground text-center">
          Tickets refill daily • Max 10 tickets
        </div>
      </CardContent>
    </Card>
  );
}
