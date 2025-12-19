import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Users, Crown, UserPlus, Swords, Search, ArrowLeft, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendFriendRequest } from '@/lib/friendSystem';
import { toast } from 'sonner';

interface GuildMember {
  id: string;
  user_id: string;
  rank: string;
  contribution: number;
  profile?: {
    username: string;
    character_data: any;
  };
}

interface Guild {
  id: string;
  name: string;
  description: string | null;
  level: number;
  banner_color: string;
  member_count?: number;
}

interface PublicGuildViewProps {
  userId: string;
  onBack: () => void;
  onChallengePvP: (opponentId: string, opponentName: string) => void;
}

export function PublicGuildView({ userId, onBack, onChallengePvP }: PublicGuildViewProps) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingFriend, setSendingFriend] = useState<string | null>(null);

  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .order('level', { ascending: false })
        .limit(50);

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

      setGuilds(guildsWithCounts);
    } catch (error) {
      console.error('Error loading guilds:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuildMembers = async (guildId: string) => {
    try {
      const { data, error } = await supabase
        .from('guild_members')
        .select('*')
        .eq('guild_id', guildId)
        .order('rank', { ascending: true });

      if (error) throw error;

      // Load profiles for each member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, character_data')
            .eq('id', member.user_id)
            .single();
          return { ...member, profile };
        })
      );

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error loading guild members:', error);
    }
  };

  const handleSelectGuild = (guild: Guild) => {
    setSelectedGuild(guild);
    loadGuildMembers(guild.id);
  };

  const handleSendFriendRequest = async (targetUserId: string, username: string) => {
    if (targetUserId === userId) {
      toast.error("You can't add yourself as a friend");
      return;
    }

    setSendingFriend(targetUserId);
    try {
      const result = await sendFriendRequest(userId, username);
      if (result.success) {
        toast.success(`Friend request sent to ${username}!`);
      } else {
        toast.error(result.error || 'Failed to send friend request');
      }
    } catch (error) {
      toast.error('Failed to send friend request');
    } finally {
      setSendingFriend(null);
    }
  };

  const handleChallengePvP = (member: GuildMember) => {
    if (member.user_id === userId) {
      toast.error("You can't challenge yourself");
      return;
    }
    const username = member.profile?.username || 'Unknown';
    onChallengePvP(member.user_id, username);
  };

  const filteredGuilds = guilds.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedGuild) {
    return (
      <div className="min-h-screen bg-gradient-arena p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button onClick={() => setSelectedGuild(null)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guilds
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedGuild.banner_color + '30' }}
                >
                  <Shield className="h-6 w-6" style={{ color: selectedGuild.banner_color }} />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedGuild.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge>Level {selectedGuild.level}</Badge>
                    <span>{members.length} members</span>
                  </CardDescription>
                </div>
              </div>
              {selectedGuild.description && (
                <p className="text-muted-foreground mt-2">{selectedGuild.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guild Members
              </h3>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {members.map((member) => {
                    const charData = member.profile?.character_data?.character;
                    const isCurrentUser = member.user_id === userId;
                    
                    return (
                      <Card key={member.id} className={isCurrentUser ? 'border-primary' : ''}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10">
                                  {member.profile?.username?.[0]?.toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {member.profile?.username || 'Unknown'}
                                  {member.rank === 'leader' && (
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                  )}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="text-xs">You</Badge>
                                  )}
                                </div>
                                {charData && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="capitalize">Lv.{charData.level} {charData.class}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {!isCurrentUser && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendFriendRequest(member.user_id, member.profile?.username || '')}
                                  disabled={sendingFriend === member.user_id}
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleChallengePvP(member)}
                                >
                                  <Swords className="h-4 w-4 mr-1" />
                                  PvP
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-arena p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hub
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              Browse Guilds
            </CardTitle>
            <CardDescription>
              View guild members, send friend requests, and challenge players to PvP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search guilds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={loadGuilds}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading guilds...
              </div>
            ) : filteredGuilds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No guilds found
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredGuilds.map((guild) => (
                    <Card 
                      key={guild.id} 
                      className="cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => handleSelectGuild(guild)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: guild.banner_color + '30' }}
                            >
                              <Shield className="h-5 w-5" style={{ color: guild.banner_color }} />
                            </div>
                            <div>
                              <div className="font-bold">{guild.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Badge variant="outline">Lv.{guild.level}</Badge>
                                <span>{guild.member_count} members</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Members
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
