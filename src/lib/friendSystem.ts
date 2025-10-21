import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Username validation schema
const usernameSchema = z.string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender?: {
    username: string;
    character_data: any;
  };
  receiver?: {
    username: string;
    character_data: any;
  };
}

export async function sendFriendRequest(senderId: string, receiverUsername: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate username format
    const validation = usernameSchema.safeParse(receiverUsername);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    // First, find the receiver by username
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', receiverUsername)
      .single();

    if (profileError || !profiles) {
      return { success: false, error: 'User not found' };
    }

    if (profiles.id === senderId) {
      return { success: false, error: 'Cannot send friend request to yourself' };
    }

    // Check if request already exists
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id, status')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${profiles.id}),and(sender_id.eq.${profiles.id},receiver_id.eq.${senderId})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'pending') {
        return { success: false, error: 'Friend request already pending' };
      }
      if (existing.status === 'accepted') {
        return { success: false, error: 'Already friends' };
      }
    }

    // Send friend request
    const { error: insertError } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: senderId,
        receiver_id: profiles.id,
        status: 'pending'
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send friend request' };
  }
}

export async function acceptFriendRequest(requestId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    return !error;
  } catch (error) {
    return false;
  }
}

export async function declineFriendRequest(requestId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);

    return !error;
  } catch (error) {
    return false;
  }
}

export async function getFriendsList(userId: string): Promise<FriendRequest[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey(username, character_data),
        receiver:profiles!friend_requests_receiver_id_fkey(username, character_data)
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) throw error;
    return (data || []) as FriendRequest[];
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
}

export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at,
        sender:profiles!friend_requests_sender_id_fkey(username, character_data)
      `)
      .eq('status', 'pending')
      .eq('receiver_id', userId);

    if (error) throw error;
    return (data || []) as FriendRequest[];
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
}
