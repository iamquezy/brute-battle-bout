import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sword, Trophy, Users, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BOSSES } from '@/lib/bossData';
interface GuildRaid {
  id: string;
  guild_id: string;
  raid_boss_id: string;
  status: string;
  boss_health: number;
  boss_max_health: number;
  started_at: string;
  completed_at?: string;
  participant_count: number;
  total_damage: number;
}

interface RaidParticipant {
  id: string;
  user_id: string;
  damage_dealt: number;
  attacks_made: number;
  username?: string;
}

interface GuildRaidsProps {
  guildId: string;
  userId: string;
  player: any;
  isLeader: boolean;
}

export function GuildRaids({ guildId, userId, player, isLeader }: GuildRaidsProps) {
  const [activeRaid, setActiveRaid] = useState<GuildRaid | null>(null);
  const [participants, setParticipants] = useState<RaidParticipant[]>([]);
  const [userParticipation, setUserParticipation] = useState<RaidParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [attacking, setAttacking] = useState(false);

  useEffect(() => {
    loadActiveRaid();
  }, [guildId]);

  const loadActiveRaid = async () => {
    setLoading(true);
    try {
      const { data: raids, error } = await supabase
        .from('guild_raids')
        .select('*')
        .eq('guild_id', guildId)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (raids && raids.length > 0) {
        setActiveRaid(raids[0]);
        await loadParticipants(raids[0].id);
      } else {
        setActiveRaid(null);
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error loading raid:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (raidId: string) => {
    try {
      const { data: participantsData, error: partError } = await supabase
        .from('guild_raid_participants')
        .select('*')
        .eq('raid_id', raidId)
        .order('damage_dealt', { ascending: false });

      if (partError) throw partError;

      // Load usernames separately
      const participantsWithUsernames = await Promise.all(
        (participantsData || []).map(async (participant) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', participant.user_id)
            .single();
          
          return {
            ...participant,
            username: profile?.username || 'Unknown'
          };
        })
      );

      setParticipants(participantsWithUsernames as any);
      const userPart = participantsWithUsernames.find(p => p.user_id === userId);
      setUserParticipation(userPart as any || null);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleStartRaid = async (bossId: string) => {
    if (!isLeader) {
      toast.error('Only guild leaders can start raids');
      return;
    }

    const boss = BOSSES.find(b => b.id === bossId);
    if (!boss) return;

    try {
      const { data, error } = await supabase
        .from('guild_raids')
        .insert({
          guild_id: guildId,
          raid_boss_id: bossId,
          boss_health: boss.health,
          boss_max_health: boss.health,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveRaid(data);
      toast.success(`${boss.name} raid started!`);
    } catch (error) {
      console.error('Error starting raid:', error);
      toast.error('Failed to start raid');
    }
  };

  const handleAttackRaid = async () => {
    if (!activeRaid || attacking) return;

    setAttacking(true);
    try {
      const boss = BOSSES.find(b => b.id === activeRaid.raid_boss_id);
      if (!boss) throw new Error('Boss not found');

      // Calculate damage
      const baseDamage = Math.max(1, player.attack - boss.defense);
      const damage = Math.floor(baseDamage * (1 + Math.random() * 0.3));

      const newBossHealth = Math.max(0, activeRaid.boss_health - damage);
      const isDefeated = newBossHealth === 0;

      // Update or insert participation
      if (userParticipation) {
        const { error: partError } = await supabase
          .from('guild_raid_participants')
          .update({
            damage_dealt: userParticipation.damage_dealt + damage,
            attacks_made: userParticipation.attacks_made + 1
          })
          .eq('id', userParticipation.id);

        if (partError) throw partError;
      } else {
        const { error: partError } = await supabase
          .from('guild_raid_participants')
          .insert({
            raid_id: activeRaid.id,
            user_id: userId,
            damage_dealt: damage,
            attacks_made: 1
          });

        if (partError) throw partError;
      }

      // Update raid
      const { error: raidError } = await supabase
        .from('guild_raids')
        .update({
          boss_health: newBossHealth,
          total_damage: activeRaid.total_damage + damage,
          participant_count: userParticipation ? activeRaid.participant_count : activeRaid.participant_count + 1,
          status: isDefeated ? 'completed' : 'active',
          completed_at: isDefeated ? new Date().toISOString() : null
        })
        .eq('id', activeRaid.id);

      if (raidError) throw raidError;

      toast.success(`Dealt ${damage} damage!`);
      
      if (isDefeated) {
        toast.success('🎉 Raid boss defeated! Rewards distributed!');
      }

      await loadActiveRaid();
    } catch (error) {
      console.error('Error attacking raid:', error);
      toast.error('Failed to attack raid');
    } finally {
      setAttacking(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guild Raids</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const boss = activeRaid ? BOSSES.find(b => b.id === activeRaid.raid_boss_id) : null;
  const healthPercentage = activeRaid ? (activeRaid.boss_health / activeRaid.boss_max_health) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sword className="h-5 w-5" />
          Guild Raids
        </CardTitle>
        <CardDescription>
          Cooperate with guild members to defeat powerful raid bosses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeRaid && boss ? (
          <>
            {/* Active Raid Boss */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{boss.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeRaid.boss_health.toLocaleString()} / {activeRaid.boss_max_health.toLocaleString()} HP
                  </p>
                </div>
                <Badge variant={activeRaid.status === 'active' ? 'default' : 'secondary'}>
                  {activeRaid.status === 'active' ? 'In Progress' : 'Completed'}
                </Badge>
              </div>

              <Progress value={healthPercentage} className="h-3" />

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{activeRaid.participant_count} Participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{activeRaid.total_damage.toLocaleString()} Total Damage</span>
                </div>
              </div>

              {activeRaid.status === 'active' && (
                <Button 
                  onClick={handleAttackRaid} 
                  disabled={attacking}
                  className="w-full"
                >
                  {attacking ? 'Attacking...' : 'Attack Raid Boss'}
                </Button>
              )}

              {/* User Stats */}
              {userParticipation && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Your Contribution</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Damage Dealt: {userParticipation.damage_dealt.toLocaleString()}</div>
                    <div>Attacks Made: {userParticipation.attacks_made}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Participants List */}
            <div>
              <h4 className="font-semibold mb-3">Top Contributors</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={index < 3 ? 'default' : 'outline'}>
                          #{index + 1}
                        </Badge>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {participant.username?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{participant.username || 'Unknown'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {participant.damage_dealt.toLocaleString()} dmg
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <>
            {/* Start New Raid */}
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No active raid</p>
              {isLeader && (
                <>
                  <p className="text-sm mb-4">Select a boss to start a new raid:</p>
                  <div className="grid gap-2">
                    {BOSSES.slice(0, 3).map(boss => (
                      <Button
                        key={boss.id}
                        variant="outline"
                        onClick={() => handleStartRaid(boss.id)}
                        className="w-full"
                      >
                        <Sword className="mr-2 h-4 w-4" />
                        {boss.name} (Lvl {boss.level})
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
