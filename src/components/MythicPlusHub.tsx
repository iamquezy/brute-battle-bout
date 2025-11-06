import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Zap, Clock, Skull, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MythicRun {
  id: string;
  user_id: string;
  dungeon_id: string;
  keystone_level: number;
  completion_time: number;
  deaths: number;
  score: number;
  rewards: any;
  completed_at: string;
  username?: string;
}

interface MythicPlusHubProps {
  userId: string;
  player: any;
  onStartRun: (dungeonId: string, level: number) => void;
  onBack: () => void;
}

const DUNGEONS = {
  shadowfang_depths: {
    name: 'Shadowfang Depths',
    description: 'A dark cavern filled with shadow creatures',
    baseTime: 1800,
    difficulty: 'Medium'
  },
  crimson_citadel: {
    name: 'Crimson Citadel',
    description: 'An ancient fortress of blood magic',
    baseTime: 2100,
    difficulty: 'Hard'
  },
  void_nexus: {
    name: 'Void Nexus',
    description: 'A rift into the void itself',
    baseTime: 2400,
    difficulty: 'Extreme'
  }
};

export function MythicPlusHub({ userId, player, onStartRun, onBack }: MythicPlusHubProps) {
  const [userRuns, setUserRuns] = useState<MythicRun[]>([]);
  const [leaderboard, setLeaderboard] = useState<MythicRun[]>([]);
  const [selectedDungeon, setSelectedDungeon] = useState<string>('shadowfang_depths');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user runs
      const { data: runs } = await supabase
        .from('mythic_plus_runs')
        .select('*')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(10);

      setUserRuns(runs || []);

      // Load leaderboard
      const { data: topRuns, error: leaderboardError } = await supabase
        .from('mythic_plus_runs')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);

      if (leaderboardError) throw leaderboardError;

      // Load usernames for leaderboard
      const runsWithUsernames = await Promise.all(
        (topRuns || []).map(async (run) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', run.user_id)
            .single();
          
          return { ...run, username: profile?.username || 'Unknown' };
        })
      );

      setLeaderboard(runsWithUsernames as any);
    } catch (error) {
      console.error('Error loading mythic+ data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (level: number, time: number, deaths: number): number => {
    const baseScore = level * 100;
    const timeBonus = Math.max(0, 1800 - time) * 0.1;
    const deathPenalty = deaths * 50;
    return Math.floor(baseScore + timeBonus - deathPenalty);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getKeystoneLevelColor = (level: number): string => {
    if (level >= 20) return 'text-red-500';
    if (level >= 15) return 'text-orange-500';
    if (level >= 10) return 'text-purple-500';
    if (level >= 5) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          Back to Hub
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Zap className="h-8 w-8 text-purple-500" />
              Mythic+ Dungeons
            </CardTitle>
            <CardDescription>
              Push your limits with increasingly difficult dungeon runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="start">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="start">
                  <Target className="h-4 w-4 mr-2" />
                  Start Run
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" />
                  My Runs
                </TabsTrigger>
                <TabsTrigger value="leaderboard">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              {/* Start Run Tab */}
              <TabsContent value="start" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Select Dungeon</h3>
                    <div className="grid gap-3">
                      {Object.entries(DUNGEONS).map(([id, dungeon]) => (
                        <Card
                          key={id}
                          className={`cursor-pointer transition-all ${
                            selectedDungeon === id ? 'border-primary border-2' : ''
                          }`}
                          onClick={() => setSelectedDungeon(id)}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold">{dungeon.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {dungeon.description}
                                </p>
                                <div className="flex gap-2">
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTime(dungeon.baseTime)}
                                  </Badge>
                                  <Badge variant="secondary">{dungeon.difficulty}</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Select Keystone Level</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 5, 7, 10, 12, 15, 18, 20].map((level) => (
                        <Button
                          key={level}
                          variant={selectedLevel === level ? 'default' : 'outline'}
                          onClick={() => setSelectedLevel(level)}
                          className={getKeystoneLevelColor(level)}
                        >
                          +{level}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Estimated Score:</span>
                          <span className="ml-2 font-bold">{calculateScore(selectedLevel, 1800, 0)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Enemy Health:</span>
                          <span className="ml-2 font-bold">+{selectedLevel * 10}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Enemy Damage:</span>
                          <span className="ml-2 font-bold">+{selectedLevel * 8}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => onStartRun(selectedDungeon, selectedLevel)}
                    className="w-full h-16 text-xl"
                  >
                    <Zap className="h-6 w-6 mr-2" />
                    Start Mythic +{selectedLevel}
                  </Button>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <ScrollArea className="h-[500px]">
                  {userRuns.length === 0 ? (
                    <div className="text-center py-12">
                      <Skull className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No runs yet. Start your first Mythic+ dungeon!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userRuns.map((run) => {
                        const dungeon = DUNGEONS[run.dungeon_id as keyof typeof DUNGEONS];
                        return (
                          <Card key={run.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-bold">{dungeon.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Mythic +{run.keystone_level}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">{run.score}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatTime(run.completion_time)} • {run.deaths} deaths
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {leaderboard.map((run, index) => {
                      const dungeon = DUNGEONS[run.dungeon_id as keyof typeof DUNGEONS];
                      return (
                        <Card key={run.id} className={index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30' : ''}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant={index < 3 ? 'default' : 'outline'}>
                                  #{index + 1}
                                </Badge>
                                <div>
                                  <div className="font-bold">{run.username}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {dungeon.name} +{run.keystone_level}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">{run.score}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatTime(run.completion_time)}
                                </div>
                              </div>
                            </div>
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
      </div>
    </div>
  );
}
