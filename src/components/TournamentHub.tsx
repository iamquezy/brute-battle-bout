import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Users, Calendar, Award, Swords } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Tournament {
  id: string;
  name: string;
  tier: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  rewards: any;
}

interface TournamentParticipant {
  id: string;
  user_id: string;
  wins: number;
  losses: number;
  points: number;
  placement: number | null;
  profiles?: {
    username: string;
    character_data: any;
  };
}

interface TournamentHubProps {
  userId: string;
  playerRating: number;
  playerLevel: number;
  onBack: () => void;
}

export function TournamentHub({ userId, playerRating, playerLevel, onBack }: TournamentHubProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [userParticipation, setUserParticipation] = useState<TournamentParticipant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (activeTournament) {
      loadParticipants(activeTournament.id);
    }
  }, [activeTournament]);

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false })
        .limit(10);

      if (!error && data) {
        setTournaments(data as Tournament[]);
        const active = data.find(t => t.status === 'active');
        if (active) {
          setActiveTournament(active as Tournament);
        }
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const loadParticipants = async (tournamentId: string) => {
    try {
      // First get participants
      const { data: participantData, error: partError } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('points', { ascending: false });

      if (partError || !participantData) {
        console.error('Error loading participants:', partError);
        return;
      }

      // Then get profiles for each participant
      const userIds = participantData.map(p => p.user_id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, character_data')
        .in('id', userIds);

      // Combine the data
      const combined = participantData.map(p => ({
        ...p,
        profiles: profileData?.find(prof => prof.id === p.user_id)
      }));

      setParticipants(combined as TournamentParticipant[]);
      const userEntry = combined.find(p => p.user_id === userId);
      setUserParticipation((userEntry as TournamentParticipant) || null);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const handleJoinTournament = async () => {
    if (!activeTournament || userParticipation) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: activeTournament.id,
          user_id: userId,
          wins: 0,
          losses: 0,
          points: 0
        }]);

      if (error) {
        toast.error('Failed to join tournament');
      } else {
        toast.success('Joined tournament!');
        loadParticipants(activeTournament.id);
      }
    } catch (error) {
      toast.error('Failed to join tournament');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-amber-700';
      case 'silver': return 'bg-slate-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-cyan-400';
      case 'diamond': return 'bg-blue-500';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                Tournament Arena
              </CardTitle>
              <CardDescription>Compete for glory and exclusive rewards</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to Hub
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Active Tournament */}
          {activeTournament ? (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className={getTierBadgeColor(activeTournament.tier)}>
                        {activeTournament.tier.toUpperCase()}
                      </Badge>
                      {activeTournament.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(activeTournament.start_date).toLocaleDateString()} - {new Date(activeTournament.end_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {participants.length} participants
                      </span>
                    </CardDescription>
                  </div>
                  {!userParticipation && (
                    <Button onClick={handleJoinTournament} disabled={loading}>
                      <Trophy className="h-4 w-4 mr-2" />
                      Join Tournament
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {userParticipation && (
                  <Card className="mb-4 bg-secondary/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Your Performance</div>
                          <div className="text-sm text-muted-foreground">
                            {userParticipation.wins}W / {userParticipation.losses}L
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{userParticipation.points}</div>
                          <div className="text-sm text-muted-foreground">Points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Leaderboard */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Leaderboard (Top 8 advance to finals)
                  </h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {participants.slice(0, 20).map((participant, index) => {
                        const isUser = participant.user_id === userId;
                        const isTopEight = index < 8;
                        
                        return (
                          <Card 
                            key={participant.id}
                            className={`${isUser ? 'border-primary' : ''} ${isTopEight ? 'bg-primary/5' : ''}`}
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 text-center font-bold text-lg ${
                                    index === 0 ? 'text-yellow-500' :
                                    index === 1 ? 'text-slate-400' :
                                    index === 2 ? 'text-amber-700' : ''
                                  }`}>
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {participant.profiles?.username}
                                      {isUser && <Badge variant="outline">You</Badge>}
                                      {isTopEight && <Badge className="bg-primary/20">Finalist</Badge>}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {participant.wins}W / {participant.losses}L
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-primary">{participant.points}</div>
                                  <div className="text-xs text-muted-foreground">points</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Rewards */}
                <Card className="mt-4 bg-gradient-gold/10 border-primary/30">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Tournament Rewards
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="font-bold text-yellow-500">🥇 1st Place</div>
                        <div className="text-muted-foreground">Legendary Item + 10,000g + Exclusive Title</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-400">🥈 2nd Place</div>
                        <div className="text-muted-foreground">Epic Item + 5,000g</div>
                      </div>
                      <div>
                        <div className="font-bold text-amber-700">🥉 3rd Place</div>
                        <div className="text-muted-foreground">Rare Item + 2,500g</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Top 8 participants receive tournament badge and bonus rewards
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active tournament at the moment</p>
                <p className="text-sm mt-2">Check back soon for the next tournament!</p>
              </CardContent>
            </Card>
          )}

          {/* Past Tournaments */}
          {tournaments.filter(t => t.status === 'completed').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Past Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {tournaments.filter(t => t.status === 'completed').map((tournament) => (
                      <Card key={tournament.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{tournament.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Completed {new Date(tournament.end_date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="outline">{tournament.tier}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
