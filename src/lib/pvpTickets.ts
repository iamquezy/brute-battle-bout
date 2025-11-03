import { supabase } from '@/integrations/supabase/client';

export interface PvPTickets {
  user_id: string;
  tickets: number;
  last_refill: string;
  total_used: number;
  updated_at: string;
}

const MAX_TICKETS = 10;
const REFILL_AMOUNT = 3;
const REFILL_INTERVAL_HOURS = 24;

export async function getPvPTickets(userId: string): Promise<PvPTickets | null> {
  try {
    // Try to get existing tickets
    let { data, error } = await supabase
      .from('pvp_tickets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching PvP tickets:', error);
      return null;
    }

    // Create initial record if doesn't exist
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from('pvp_tickets')
        .insert([{ user_id: userId, tickets: REFILL_AMOUNT }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating PvP tickets:', insertError);
        return null;
      }

      data = newData;
    }

    // Check if refill is due
    const lastRefill = new Date(data.last_refill);
    const now = new Date();
    const hoursSinceRefill = (now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRefill >= REFILL_INTERVAL_HOURS) {
      const newTickets = Math.min(data.tickets + REFILL_AMOUNT, MAX_TICKETS);
      
      const { data: updatedData, error: updateError } = await supabase
        .from('pvp_tickets')
        .update({ 
          tickets: newTickets, 
          last_refill: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating PvP tickets:', updateError);
        return data;
      }

      return updatedData;
    }

    return data;
  } catch (error) {
    console.error('Error in getPvPTickets:', error);
    return null;
  }
}

export async function useTicket(userId: string): Promise<boolean> {
  try {
    const tickets = await getPvPTickets(userId);
    if (!tickets || tickets.tickets <= 0) {
      return false;
    }

    const { error } = await supabase
      .from('pvp_tickets')
      .update({ 
        tickets: tickets.tickets - 1,
        total_used: tickets.total_used + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error using ticket:', error);
    return false;
  }
}

export async function buyTickets(userId: string, amount: number, goldCost: number): Promise<boolean> {
  try {
    const tickets = await getPvPTickets(userId);
    if (!tickets) return false;

    const newAmount = Math.min(tickets.tickets + amount, MAX_TICKETS);

    const { error } = await supabase
      .from('pvp_tickets')
      .update({ 
        tickets: newAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error buying tickets:', error);
    return false;
  }
}

export function getTicketRefillTime(lastRefill: string): { hours: number; minutes: number; canRefill: boolean } {
  const lastRefillDate = new Date(lastRefill);
  const now = new Date();
  const nextRefill = new Date(lastRefillDate.getTime() + REFILL_INTERVAL_HOURS * 60 * 60 * 1000);
  
  const msUntilRefill = nextRefill.getTime() - now.getTime();
  const canRefill = msUntilRefill <= 0;
  
  if (canRefill) {
    return { hours: 0, minutes: 0, canRefill: true };
  }
  
  const hours = Math.floor(msUntilRefill / (1000 * 60 * 60));
  const minutes = Math.floor((msUntilRefill % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, canRefill: false };
}
