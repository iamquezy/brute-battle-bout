import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Swords, Trophy, Shield, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GuildWar {
  id: string;
  guild_1_id: string;
  guild_2_id: string;
  guild_1_points: number;
  guild_2_points: number;
  winner_id: string | null;
  start_time: string;
  end_time: string | null;
  status: 'active' | 'completed' | 'cancelled';
  guild_1?: { name: string };
  guild_2?: { name: string };
}

interface GuildWarsProps {
  userId: string;
  userGuildId: string | null;
  isGuildLeader: boolean;
  onBack: () => void;
  onStartBattle: (opponentId: string) => void;
}

export function GuildWars({ userId, userGuildId, isGuildLeader, onBack, onStartBattle }: GuildWarsProps) {
  const [activeWars, setActiveWars] = useState<GuildWar[]>([]);
  const [pastWars, setPastWars] = useState<GuildWar[]>([]);
  const [availableGuilds, setAvailableGuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWars();
    loadAvailableGuilds();
  }, [userGuildId]);

  const loadWars = async () => {
    if (!userGuildId) return;

    try {
      const { data: wars, error } = await supabase
        .from('guild_wars')
        .select('*')
        .or(`guild_1_id.eq.${userGuildId},guild_2_id.eq.${userGuildId}`)
        .order('created_at', { ascending: false });

      if (!error && wars) {
        // Get guild names separately
        const guildIds = [...new Set(wars.flatMap(w => [w.guild_1_id, w.guild_2_id]))];
        const { data: guilds } = await supabase
          .from('guilds')
          .select('id, name')
          .in('id', guildIds);

        const guildMap = new Map(guilds?.map(g => [g.id, g]) || []);

        const enrichedWars = wars.map(w => ({
          ...w,
          guild_1: guildMap.get(w.guild_1_id),
          guild_2: guildMap.get(w.guild_2_id)
        })) as GuildWar[];

        setActiveWars(enrichedWars.filter(w => w.status === 'active'));
        setPastWars(enrichedWars.filter(w => w.status === 'completed'));
      }
    } catch (error) {
      console.error('Error loading wars:', error);
    }
  };

  const loadAvailableGuilds = async () => {
    if (!userGuildId) return;

    try {
      const { data, error } = await supabase
        .from('guilds')
        .select('id, name, level, member_limit')
        .neq('id', userGuildId)
        .limit(20);

      if (!error && data) {
        setAvailableGuilds(data);
      }
    } catch (error) {
      console.error('Error loading guilds:', error);
    }
  };

  const handleDeclareWar = async (targetGuildId: string) => {
    if (!userGuildId || !isGuildLeader) return;

    setLoading(true);
    try {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 24); // 24 hour war

      const { error } = await supabase
        .from('guild_wars')
        .insert([{
          guild_1_id: userGuildId,
          guild_2_id: targetGuildId,
          end_time: endTime.toISOString()
        }]);

      if (error) {
        toast.error('Failed to declare war');
      } else {
        toast.success('War declared! Gather your warriors!');
        loadWars();
      }
    } catch (error) {
      toast.error('Failed to declare war');
    } finally {
      setLoading(false);
    }
  };

  const getWarScore = (war: GuildWar) => {
    const isGuild1 = war.guild_1_id === userGuildId;
    const ourPoints = isGuild1 ? war.guild_1_points : war.guild_2_points;
    const theirPoints = isGuild1 ? war.guild_2_points : war.guild_1_points;
    return { ourPoints, theirPoints };
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (!userGuildId) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">You must be in a guild to participate in guild wars</p>
          <Button onClick={onBack} className="mt-4">Back to Hub</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Swords className="h-8 w-8 text-destructive" />
                Guild Wars
              </CardTitle>
              <CardDescription>Dominate the battlefield and claim victory for your guild</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to Hub
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Active Wars */}
          {activeWars.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-destructive" />
                  Active Wars ({activeWars.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeWars.map((war) => {
                    const { ourPoints, theirPoints } = getWarScore(war);
                    const isGuild1 = war.guild_1_id === userGuildId;
                    const enemyGuild = isGuild1 ? war.guild_2 : war.guild_1;
                    
                    return (
                      <Card key={war.id} className="bg-background">
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="text-center flex-1">
                                <div className="font-bold">Your Guild</div>
                                <div className="text-3xl font-bold text-primary">{ourPoints}</div>
                              </div>
                              <div className="text-center px-6">
                                <Badge variant="destructive" className="text-lg px-4 py-2">VS</Badge>
                              </div>
                              <div className="text-center flex-1">
                                <div className="font-bold">{enemyGuild?.name}</div>
                                <div className="text-3xl font-bold text-destructive">{theirPoints}</div>
                              </div>
                            </div>
                            
                            <div className="text-center text-sm text-muted-foreground">
                              {war.end_time && getTimeRemaining(war.end_time)}
                            </div>

                            <div className="flex gap-2 justify-center">
                              <Button 
                                onClick={() => {
                                  // TODO: Open war details / matchmaking
                                  toast.info('War battles coming soon!');
                                }}
                                className="bg-gradient-gold"
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Join Battle
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Declare War */}
          {isGuildLeader && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Declare War
                </CardTitle>
                <CardDescription>Challenge another guild to a 24-hour war</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {availableGuilds.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No guilds available</p>
                    ) : (
                      availableGuilds.map((guild) => (
                        <Card key={guild.id}>
                          <CardContent className="pt-4 flex items-center justify-between">
                            <div>
                              <div className="font-medium">{guild.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Level {guild.level}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleDeclareWar(guild.id)}
                              disabled={loading}
                              variant="destructive"
                            >
                              <Swords className="h-4 w-4 mr-2" />
                              Declare War
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* War History */}
          {pastWars.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>War History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {pastWars.map((war) => {
                      const { ourPoints, theirPoints } = getWarScore(war);
                      const won = ourPoints > theirPoints;
                      const isGuild1 = war.guild_1_id === userGuildId;
                      const enemyGuild = isGuild1 ? war.guild_2 : war.guild_1;
                      
                      return (
                        <Card key={war.id} className={won ? 'border-green-500/50' : 'border-red-500/50'}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Badge variant={won ? 'default' : 'destructive'}>
                                  {won ? 'Victory' : 'Defeat'}
                                </Badge>
                                <div className="mt-2 font-medium">vs {enemyGuild?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {ourPoints} - {theirPoints}
                                </div>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                {new Date(war.start_time).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
