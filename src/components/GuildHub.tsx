import { useState, useEffect } from 'react';
import { Character } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  createGuild, 
  joinGuild, 
  leaveGuild, 
  getUserGuild, 
  searchGuilds,
  getGuildMembers,
  sendGuildMessage,
  getGuildMessages,
  Guild,
  GuildMember,
  GuildMessage
} from '@/lib/guildSystem';
import { Users, Shield, ArrowLeft, Crown, Send, Search, Plus, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GuildHubProps {
  player: Character;
  userId: string;
  username: string;
  onBack: () => void;
}

export function GuildHub({ player, userId, username, onBack }: GuildHubProps) {
  const [userGuild, setUserGuild] = useState<{ guild: Guild; member: GuildMember } | null>(null);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [guildMessages, setGuildMessages] = useState<GuildMessage[]>([]);
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserGuild();
    loadAvailableGuilds();
  }, [userId]);

  useEffect(() => {
    if (userGuild) {
      loadGuildMembers();
      loadGuildMessages();
      
      // Subscribe to realtime messages
      const channel = supabase
        .channel('guild_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'guild_messages',
            filter: `guild_id=eq.${userGuild.guild.id}`
          },
          (payload) => {
            setGuildMessages(prev => [...prev, payload.new as GuildMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userGuild]);

  const loadUserGuild = async () => {
    const data = await getUserGuild(userId);
    setUserGuild(data);
  };

  const loadGuildMembers = async () => {
    if (!userGuild) return;
    const members = await getGuildMembers(userGuild.guild.id);
    setGuildMembers(members);
  };

  const loadGuildMessages = async () => {
    if (!userGuild) return;
    const messages = await getGuildMessages(userGuild.guild.id);
    setGuildMessages(messages);
  };

  const loadAvailableGuilds = async () => {
    const guilds = await searchGuilds(searchTerm);
    setAvailableGuilds(guilds);
  };

  const handleCreateGuild = async () => {
    if (!guildName.trim()) {
      toast.error('Please enter a guild name');
      return;
    }

    setLoading(true);
    const result = await createGuild(userId, guildName, guildDescription);
    setLoading(false);

    if (result.success) {
      toast.success('Guild created successfully!');
      setGuildName('');
      setGuildDescription('');
      loadUserGuild();
    } else {
      toast.error(result.error || 'Failed to create guild');
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    setLoading(true);
    const result = await joinGuild(userId, guildId);
    setLoading(false);

    if (result.success) {
      toast.success('Joined guild!');
      loadUserGuild();
    } else {
      toast.error(result.error || 'Failed to join guild');
    }
  };

  const handleLeaveGuild = async () => {
    setLoading(true);
    const result = await leaveGuild(userId);
    setLoading(false);

    if (result.success) {
      toast.success('Left guild');
      setUserGuild(null);
      loadAvailableGuilds();
    } else {
      toast.error(result.error || 'Failed to leave guild');
    }
  };

  const handleSendMessage = async () => {
    if (!userGuild || !messageInput.trim()) return;

    const success = await sendGuildMessage(
      userGuild.guild.id,
      userId,
      username,
      messageInput
    );

    if (success) {
      setMessageInput('');
    } else {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hub
        </Button>

        {!userGuild ? (
          // No Guild - Show Browse and Create
          <Tabs defaultValue="browse">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">
                <Search className="h-4 w-4 mr-2" />
                Browse Guilds
              </TabsTrigger>
              <TabsTrigger value="create">
                <Plus className="h-4 w-4 mr-2" />
                Create Guild
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse">
              <Card>
                <CardHeader>
                  <CardTitle>Available Guilds</CardTitle>
                  <CardDescription>Join an existing guild</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search guilds..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button onClick={loadAvailableGuilds}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {availableGuilds.map((guild) => (
                          <Card key={guild.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{guild.name}</h3>
                                    <Badge>Level {guild.level}</Badge>
                                  </div>
                                  {guild.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {guild.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    {guild.member_count || 0} / {guild.member_limit} members
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => handleJoinGuild(guild.id)}
                                  disabled={loading || guild.member_count >= guild.member_limit}
                                >
                                  Join
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {availableGuilds.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No guilds found. Create one!
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create Your Guild</CardTitle>
                  <CardDescription>Start your own guild and recruit members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Guild Name</label>
                    <Input
                      placeholder="Enter guild name..."
                      value={guildName}
                      onChange={(e) => setGuildName(e.target.value)}
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                    <Textarea
                      placeholder="Describe your guild..."
                      value={guildDescription}
                      onChange={(e) => setGuildDescription(e.target.value)}
                      maxLength={200}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateGuild} 
                    disabled={loading || !guildName.trim()}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Create Guild
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Has Guild - Show Guild Interface
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" style={{ color: userGuild.guild.banner_color }} />
                    {userGuild.guild.name}
                  </CardTitle>
                  {userGuild.guild.description && (
                    <CardDescription className="mt-2">{userGuild.guild.description}</CardDescription>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Badge>Level {userGuild.guild.level}</Badge>
                    <Badge variant="outline">{guildMembers.length} / {userGuild.guild.member_limit} Members</Badge>
                    <Badge variant={userGuild.member.rank === 'leader' ? 'default' : 'secondary'}>
                      {userGuild.member.rank === 'leader' && <Crown className="h-3 w-3 mr-1" />}
                      {userGuild.member.rank.charAt(0).toUpperCase() + userGuild.member.rank.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Button onClick={handleLeaveGuild} variant="destructive" disabled={userGuild.member.rank === 'leader'}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chat">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat">Guild Chat</TabsTrigger>
                  <TabsTrigger value="members">Members ({guildMembers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="space-y-4">
                  <ScrollArea className="h-[400px] border rounded-lg p-4">
                    <div className="space-y-3">
                      {guildMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{msg.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                      {guildMessages.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No messages yet. Start the conversation!
                        </p>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="members">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {guildMembers.map((member) => {
                        const charData = member.profile?.character_data?.character;
                        return (
                          <Card key={member.id}>
                            <CardContent className="pt-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {member.profile?.username?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {member.profile?.username || 'Unknown'}
                                    {member.rank === 'leader' && <Crown className="h-4 w-4 text-yellow-500" />}
                                  </div>
                                  {charData && (
                                    <div className="text-sm text-muted-foreground">
                                      Level {charData.level} {charData.class}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant={member.rank === 'leader' ? 'default' : member.rank === 'officer' ? 'secondary' : 'outline'}>
                                {member.rank}
                              </Badge>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
