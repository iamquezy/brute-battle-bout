import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skull, Sword, Users, Trophy, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorldBoss {
  id: string;
  boss_id: string;
  current_health: number;
  max_health: number;
  status: string;
  spawned_at: string;
  total_participants: number;
  total_damage: number;
}

interface WorldBossParticipant {
  id: string;
  user_id: string;
  damage_dealt: number;
  attacks_made: number;
  username?: string;
}

interface WorldBossProps {
  userId: string;
  player: any;
  onBack: () => void;
}

const WORLD_BOSSES = {
  ancient_dragon: {
    name: 'Ancient Dragon',
    description: 'A primordial dragon that threatens all realms',
    health: 50000000,
    level: 100,
    rewards: { gold: 10000, xp: 50000, title: 'Dragonslayer' }
  },
  titan_colossus: {
    name: 'Titan Colossus',
    description: 'A colossal titan from the age of legends',
    health: 75000000,
    level: 120,
    rewards: { gold: 15000, xp: 75000, title: 'Titan Conqueror' }
  },
  void_lord: {
    name: 'Void Lord',
    description: 'An entity from the void between worlds',
    health: 100000000,
    level: 150,
    rewards: { gold: 25000, xp: 100000, title: 'Void Vanquisher' }
  }
};

export function WorldBoss({ userId, player, onBack }: WorldBossProps) {
  const [activeBoss, setActiveBoss] = useState<WorldBoss | null>(null);
  const [participants, setParticipants] = useState<WorldBossParticipant[]>([]);
  const [userParticipation, setUserParticipation] = useState<WorldBossParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [attacking, setAttacking] = useState(false);

  useEffect(() => {
    loadActiveBoss();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('world_boss_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'world_bosses'
        },
        () => {
          loadActiveBoss();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActiveBoss = async () => {
    setLoading(true);
    try {
      const { data: bosses, error } = await supabase
        .from('world_bosses')
        .select('*')
        .eq('status', 'active')
        .order('spawned_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (bosses && bosses.length > 0) {
        setActiveBoss(bosses[0]);
        await loadParticipants(bosses[0].id);
      } else {
        setActiveBoss(null);
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error loading world boss:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (bossId: string) => {
    try {
      const { data: participantsData, error } = await supabase
        .from('world_boss_participants')
        .select('*')
        .eq('boss_id', bossId)
        .order('damage_dealt', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Load usernames
      const withUsernames = await Promise.all(
        (participantsData || []).map(async (p) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', p.user_id)
            .single();
          
          return { ...p, username: profile?.username || 'Unknown' };
        })
      );

      setParticipants(withUsernames as any);
      const userPart = withUsernames.find(p => p.user_id === userId);
      setUserParticipation(userPart as any || null);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleAttack = async () => {
    if (!activeBoss || attacking || !player) return;

    setAttacking(true);
    try {
      const boss = WORLD_BOSSES[activeBoss.boss_id as keyof typeof WORLD_BOSSES];
      if (!boss) throw new Error('Boss not found');

      // Calculate damage (player attack + critical hit chance)
      const baseDamage = player.attack * (1 + Math.random() * 0.5);
      const isCrit = Math.random() < (player.critChance || 0.1);
      const damage = Math.floor(baseDamage * (isCrit ? 2 : 1));

      const newHealth = Math.max(0, activeBoss.current_health - damage);
      const isDefeated = newHealth === 0;

      // Update or insert participation
      if (userParticipation) {
        const { error: partError } = await supabase
          .from('world_boss_participants')
          .update({
            damage_dealt: userParticipation.damage_dealt + damage,
            attacks_made: userParticipation.attacks_made + 1
          })
          .eq('id', userParticipation.id);

        if (partError) throw partError;
      } else {
        const { error: partError } = await supabase
          .from('world_boss_participants')
          .insert({
            boss_id: activeBoss.id,
            user_id: userId,
            damage_dealt: damage,
            attacks_made: 1
          });

        if (partError) throw partError;
      }

      // Update boss
      const { error: bossError } = await supabase
        .from('world_bosses')
        .update({
          current_health: newHealth,
          total_damage: activeBoss.total_damage + damage,
          total_participants: userParticipation ? activeBoss.total_participants : activeBoss.total_participants + 1,
          status: isDefeated ? 'defeated' : 'active',
          defeated_at: isDefeated ? new Date().toISOString() : null
        })
        .eq('id', activeBoss.id);

      if (bossError) throw bossError;

      toast.success(isCrit ? `CRITICAL HIT! ${damage.toLocaleString()} damage!` : `${damage.toLocaleString()} damage dealt!`);
      
      if (isDefeated) {
        toast.success('🎉 World Boss defeated! Rewards distributed!');
      }

      await loadActiveBoss();
    } catch (error) {
      console.error('Error attacking boss:', error);
      toast.error('Failed to attack');
    } finally {
      setAttacking(false);
    }
  };

  const bossData = activeBoss ? WORLD_BOSSES[activeBoss.boss_id as keyof typeof WORLD_BOSSES] : null;
  const healthPercentage = activeBoss ? (activeBoss.current_health / activeBoss.max_health) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          Back to Hub
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Skull className="h-8 w-8 text-destructive" />
              World Boss
            </CardTitle>
            <CardDescription>
              Join players worldwide to defeat legendary bosses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : activeBoss && bossData ? (
              <div className="space-y-6">
                {/* Boss Info */}
                <div className="text-center p-6 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-lg border-2 border-destructive/50">
                  <h2 className="text-4xl font-bold mb-2">{bossData.name}</h2>
                  <Badge variant="destructive" className="mb-2">
                    Level {bossData.level}
                  </Badge>
                  <p className="text-muted-foreground mb-4">{bossData.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Health</span>
                      <span className="font-mono">
                        {activeBoss.current_health.toLocaleString()} / {activeBoss.max_health.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={healthPercentage} className="h-4" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{activeBoss.total_participants.toLocaleString()} Warriors</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Sword className="h-4 w-4" />
                      <span>{activeBoss.total_damage.toLocaleString()} Total DMG</span>
                    </div>
                  </div>
                </div>

                {/* Attack Button */}
                {activeBoss.status === 'active' && (
                  <Button 
                    onClick={handleAttack} 
                    disabled={attacking}
                    className="w-full h-16 text-xl"
                    variant="destructive"
                  >
                    <Zap className="h-6 w-6 mr-2" />
                    {attacking ? 'Attacking...' : 'ATTACK!'}
                  </Button>
                )}

                {/* User Stats */}
                {userParticipation && (
                  <Card className="bg-primary/5">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">Your Contribution</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Damage Dealt</div>
                          <div className="text-2xl font-bold">{userParticipation.damage_dealt.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Attacks</div>
                          <div className="text-2xl font-bold">{userParticipation.attacks_made}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Contributors */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top 100 Contributors
                  </h4>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {participants.map((participant, index) => (
                        <Card
                          key={participant.id}
                          className={index < 10 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30' : ''}
                        >
                          <CardContent className="pt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant={index === 0 ? 'default' : index < 3 ? 'secondary' : 'outline'}>
                                #{index + 1}
                              </Badge>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {participant.username?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{participant.username}</div>
                                <div className="text-xs text-muted-foreground">
                                  {participant.attacks_made} attacks
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{participant.damage_dealt.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">damage</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Skull className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Active World Boss</h3>
                <p className="text-muted-foreground">
                  A new world boss will spawn soon. Check back later!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
