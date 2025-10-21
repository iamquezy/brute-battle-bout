import { useState, useEffect } from 'react';
import { Character } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  getFriendsList, 
  getPendingRequests,
  FriendRequest 
} from '@/lib/friendSystem';
import { getMatchHistory, loadOpponentSnapshot } from '@/lib/pvpLogic';
import { supabase } from '@/integrations/supabase/client';
import { Users, Swords, History, Trophy, UserPlus, Check, X, Target, Shield, Zap, Heart } from 'lucide-react';
import { toast } from 'sonner';
import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';

interface PvPHubProps {
  player: Character;
  userId: string;
  playerRating: number;
  onChallengeOpponent: (opponentId: string, opponentName: string) => void;
  onBack: () => void;
}

export function PvPHub({ player, userId, playerRating, onChallengeOpponent, onBack }: PvPHubProps) {
  const [friendUsername, setFriendUsername] = useState('');
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const avatarMap = {
    fighter: warriorAvatar,
    mage: mageAvatar,
    archer: archerAvatar
  };

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
    loadLeaderboard();
    loadMatchHistory();
  }, [userId]);

  const loadFriends = async () => {
    const friendsList = await getFriendsList(userId);
    setFriends(friendsList);
  };

  const loadPendingRequests = async () => {
    const requests = await getPendingRequests(userId);
    setPendingRequests(requests);
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rating', { ascending: false })
        .limit(20);

      if (!error && data) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const loadMatchHistory = async () => {
    const history = await getMatchHistory(userId, 20);
    setMatchHistory(history);
  };

  const handleSendRequest = async () => {
    if (!friendUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setLoading(true);
    const result = await sendFriendRequest(userId, friendUsername.trim());
    setLoading(false);

    if (result.success) {
      toast.success('Friend request sent!');
      setFriendUsername('');
    } else {
      toast.error(result.error || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) {
      toast.success('Friend request accepted!');
      loadFriends();
      loadPendingRequests();
    } else {
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const success = await declineFriendRequest(requestId);
    if (success) {
      toast.success('Friend request declined');
      loadPendingRequests();
    } else {
      toast.error('Failed to decline request');
    }
  };

  const handleChallengeFriend = async (friendRequest: FriendRequest) => {
    const opponentId = friendRequest.sender_id === userId ? friendRequest.receiver_id : friendRequest.sender_id;
    const opponentData = friendRequest.sender_id === userId ? friendRequest.receiver : friendRequest.sender;
    
    if (opponentData?.username) {
      onChallengeOpponent(opponentId, opponentData.username);
    }
  };

  const handleChallengeLeaderboard = (opponent: any) => {
    const levelDiff = Math.abs(opponent.level - player.level);
    if (levelDiff > 5) {
      toast.error('Can only challenge players within 5 levels');
      return;
    }
    onChallengeOpponent(opponent.user_id, opponent.username);
  };

  const getFriendCharacter = (friendRequest: FriendRequest): Character | null => {
    const opponentData = friendRequest.sender_id === userId ? friendRequest.receiver : friendRequest.sender;
    return opponentData?.character_data?.character || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Swords className="h-8 w-8 text-primary" />
                PvP Arena
              </CardTitle>
              <CardDescription>Challenge other players and climb the rankings</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Your Rating</div>
              <div className="text-2xl font-bold text-primary">{playerRating}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="matchmaking" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="matchmaking">
                <Target className="h-4 w-4 mr-2" />
                Matchmaking
              </TabsTrigger>
              <TabsTrigger value="friends">
                <Users className="h-4 w-4 mr-2" />
                Friends ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Rankings
              </TabsTrigger>
            </TabsList>

            {/* Matchmaking Tab */}
            <TabsContent value="matchmaking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Players</CardTitle>
                  <CardDescription>Find opponents to battle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">Random Opponent</h3>
                            <p className="text-sm text-muted-foreground">Challenge a player near your rating</p>
                          </div>
                          <Button onClick={() => {
                            // Find random opponent from leaderboard
                            const eligible = leaderboard.filter(p => 
                              p.user_id !== userId && 
                              Math.abs(p.rating - playerRating) <= 100
                            );
                            if (eligible.length > 0) {
                              const random = eligible[Math.floor(Math.random() * eligible.length)];
                              onChallengeOpponent(random.user_id, random.username);
                            } else {
                              toast.error('No opponents available in your rating range');
                            }
                          }}>
                            <Swords className="h-4 w-4 mr-2" />
                            Find Match
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Friends Tab */}
            <TabsContent value="friends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Friend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter username"
                      value={friendUsername}
                      onChange={(e) => setFriendUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                    />
                    <Button onClick={handleSendRequest} disabled={loading}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send Request
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {pendingRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {pendingRequests.map((request) => (
                          <Card key={request.id}>
                            <CardContent className="pt-4 flex items-center justify-between">
                              <span className="font-medium">{request.sender?.username}</span>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeclineRequest(request.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Friends List ({friends.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {friends.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No friends yet. Add some above!</p>
                      ) : (
                        friends.map((friend) => {
                          const isReceiver = friend.receiver_id === userId;
                          const friendData = isReceiver ? friend.sender : friend.receiver;
                          const friendChar = getFriendCharacter(friend);
                          
                          return (
                            <Card key={friend.id}>
                              <CardContent className="pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={friendChar ? avatarMap[friendChar.class] : undefined} />
                                    <AvatarFallback>{friendData?.username?.[0]?.toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{friendData?.username}</div>
                                    {friendChar && (
                                      <div className="text-sm text-muted-foreground">
                                        Level {friendChar.level} {friendChar.class.charAt(0).toUpperCase() + friendChar.class.slice(1)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button onClick={() => handleChallengeFriend(friend)}>
                                  <Swords className="h-4 w-4 mr-2" />
                                  Challenge
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Match History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                  <CardDescription>Your last 20 PvP battles</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {matchHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No match history yet. Start battling!</p>
                    ) : (
                      <div className="space-y-2">
                        {matchHistory.map((match) => {
                          const isAttacker = match.attacker_id === userId;
                          const won = match.winner_id === userId;
                          const opponent = isAttacker ? match.defender_snapshot : match.attacker_snapshot;
                          
                          return (
                            <Card key={match.id} className={won ? 'border-green-500/50' : 'border-red-500/50'}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge variant={won ? 'default' : 'destructive'}>
                                      {won ? 'Victory' : 'Defeat'}
                                    </Badge>
                                    <div>
                                      <div className="font-medium">vs {opponent.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Level {opponent.level} {opponent.class}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`font-semibold ${won ? 'text-green-500' : 'text-red-500'}`}>
                                      {won ? '+' : ''}{match.rating_change} Rating
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(match.created_at).toLocaleDateString()}
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Global Rankings</CardTitle>
                  <CardDescription>Top players by rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {leaderboard.map((entry, index) => (
                        <Card key={entry.id} className={entry.user_id === userId ? 'border-primary' : ''}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 text-center font-bold text-lg">
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {entry.username}
                                    {entry.user_id === userId && <Badge variant="outline">You</Badge>}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Level {entry.level} • {entry.wins}W / {entry.losses}L
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-semibold text-primary">{entry.rating}</div>
                                  <div className="text-xs text-muted-foreground">Rating</div>
                                </div>
                                {entry.user_id !== userId && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleChallengeLeaderboard(entry)}
                                    disabled={Math.abs(entry.level - player.level) > 5}
                                  >
                                    <Swords className="h-3 w-3 mr-1" />
                                    Challenge
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex justify-center">
            <Button variant="outline" onClick={onBack}>
              Back to Hub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
