import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  level: number;
  experience: number;
  member_limit: number;
  banner_color: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  rank: 'member' | 'officer' | 'leader';
  contribution: number;
  joined_at: string;
  profile?: {
    username: string;
    character_data: any;
  };
}

export interface GuildMessage {
  id: string;
  guild_id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

const guildNameSchema = z.string()
  .trim()
  .min(3, 'Guild name must be at least 3 characters')
  .max(30, 'Guild name must be at most 30 characters')
  .regex(/^[a-zA-Z0-9 _-]+$/, 'Guild name can only contain letters, numbers, spaces, underscores, and hyphens');

const guildDescriptionSchema = z.string()
  .trim()
  .max(200, 'Description must be at most 200 characters')
  .optional();

export async function createGuild(
  leaderId: string, 
  name: string, 
  description?: string
): Promise<{ success: boolean; guildId?: string; error?: string }> {
  try {
    // Validate inputs
    const nameValidation = guildNameSchema.safeParse(name);
    if (!nameValidation.success) {
      return { success: false, error: nameValidation.error.errors[0].message };
    }

    if (description) {
      const descValidation = guildDescriptionSchema.safeParse(description);
      if (!descValidation.success) {
        return { success: false, error: descValidation.error.errors[0].message };
      }
    }

    // Check if user is already in a guild
    const { data: existingMember } = await supabase
      .from('guild_members')
      .select('id')
      .eq('user_id', leaderId)
      .maybeSingle();

    if (existingMember) {
      return { success: false, error: 'You are already in a guild' };
    }

    // Create guild
    const { data: guild, error: guildError } = await supabase
      .from('guilds')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        leader_id: leaderId
      })
      .select()
      .single();

    if (guildError || !guild) {
      return { success: false, error: guildError?.message || 'Failed to create guild' };
    }

    // Add leader as member
    const { error: memberError } = await supabase
      .from('guild_members')
      .insert({
        guild_id: guild.id,
        user_id: leaderId,
        rank: 'leader'
      });

    if (memberError) {
      return { success: false, error: 'Failed to add leader to guild' };
    }

    return { success: true, guildId: guild.id };
  } catch (error) {
    return { success: false, error: 'Failed to create guild' };
  }
}

export async function joinGuild(
  userId: string, 
  guildId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user is already in a guild
    const { data: existingMember } = await supabase
      .from('guild_members')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      return { success: false, error: 'You are already in a guild' };
    }

    // Check guild member count
    const { data: guild } = await supabase
      .from('guilds')
      .select('member_limit')
      .eq('id', guildId)
      .single();

    const { count } = await supabase
      .from('guild_members')
      .select('*', { count: 'exact', head: true })
      .eq('guild_id', guildId);

    if (count !== null && guild && count >= guild.member_limit) {
      return { success: false, error: 'Guild is full' };
    }

    // Join guild
    const { error } = await supabase
      .from('guild_members')
      .insert({
        guild_id: guildId,
        user_id: userId,
        rank: 'member'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to join guild' };
  }
}

export async function leaveGuild(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: member } = await supabase
      .from('guild_members')
      .select('guild_id, rank')
      .eq('user_id', userId)
      .single();

    if (!member) {
      return { success: false, error: 'You are not in a guild' };
    }

    if (member.rank === 'leader') {
      return { success: false, error: 'Guild leaders must transfer leadership before leaving' };
    }

    const { error } = await supabase
      .from('guild_members')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to leave guild' };
  }
}

export async function getGuildInfo(guildId: string): Promise<Guild | null> {
  try {
    const { data: guild, error } = await supabase
      .from('guilds')
      .select('*')
      .eq('id', guildId)
      .single();

    if (error || !guild) return null;

    // Get member count
    const { count } = await supabase
      .from('guild_members')
      .select('*', { count: 'exact', head: true })
      .eq('guild_id', guildId);

    return { ...guild, member_count: count || 0 };
  } catch (error) {
    return null;
  }
}

export async function getGuildMembers(guildId: string): Promise<GuildMember[]> {
  try {
    const { data, error } = await supabase
      .from('guild_members')
      .select(`
        *,
        profile:profiles(username, character_data)
      `)
      .eq('guild_id', guildId)
      .order('rank', { ascending: true })
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(member => ({
      ...member,
      rank: member.rank as 'member' | 'officer' | 'leader'
    })) as GuildMember[];
  } catch (error) {
    console.error('Error fetching guild members:', error);
    return [];
  }
}

export async function getUserGuild(userId: string): Promise<{ guild: Guild; member: GuildMember } | null> {
  try {
    const { data: member, error: memberError } = await supabase
      .from('guild_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError || !member) return null;

    const guild = await getGuildInfo(member.guild_id);
    if (!guild) return null;

    return { guild, member: { ...member, rank: member.rank as 'member' | 'officer' | 'leader' } };
  } catch (error) {
    return null;
  }
}

export async function sendGuildMessage(
  guildId: string, 
  userId: string, 
  username: string, 
  message: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('guild_messages')
      .insert({
        guild_id: guildId,
        user_id: userId,
        username,
        message: message.trim()
      });

    return !error;
  } catch (error) {
    return false;
  }
}

export async function getGuildMessages(guildId: string, limit: number = 50): Promise<GuildMessage[]> {
  try {
    const { data, error } = await supabase
      .from('guild_messages')
      .select('*')
      .eq('guild_id', guildId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse();
  } catch (error) {
    console.error('Error fetching guild messages:', error);
    return [];
  }
}

export async function searchGuilds(searchTerm?: string): Promise<Guild[]> {
  try {
    let query = supabase
      .from('guilds')
      .select('*')
      .order('level', { ascending: false })
      .limit(20);

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get member counts
    const guildsWithCounts = await Promise.all(
      (data || []).map(async (guild) => {
        const { count } = await supabase
          .from('guild_members')
          .select('*', { count: 'exact', head: true })
          .eq('guild_id', guild.id);
        return { ...guild, member_count: count || 0 };
      })
    );

    return guildsWithCounts;
  } catch (error) {
    console.error('Error searching guilds:', error);
    return [];
  }
}
