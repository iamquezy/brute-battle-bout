import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Gift, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeaderboardReward {
  id: string;
  season: string;
  rank: number;
  rewards: {
    gold?: number;
    gems?: number;
    title?: string;
  };
  claimed: boolean;
  created_at: string;
}

interface LeaderboardRewardsProps {
  userId: string;
  onClaimReward: (rewards: any) => void;
}

export function LeaderboardRewards({ userId, onClaimReward }: LeaderboardRewardsProps) {
  const [rewards, setRewards] = useState<LeaderboardReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, [userId]);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRewards((data as any) || []);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (reward: LeaderboardReward) => {
    try {
      const { error } = await supabase
        .from('leaderboard_rewards')
        .update({ claimed: true })
        .eq('id', reward.id);

      if (error) throw error;

      onClaimReward(reward.rewards);
      toast.success('Reward claimed!');
      loadRewards();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-amber-600" />;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Leaderboard Rewards
        </CardTitle>
        <CardDescription>
          Claim your competitive season rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No rewards available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Climb the leaderboard to earn seasonal rewards!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getRankBadge(reward.rank)}
                      <div>
                        <p className="font-semibold">Season {reward.season}</p>
                        <p className="text-sm text-muted-foreground">
                          Rank #{reward.rank}
                        </p>
                      </div>
                    </div>
                    {reward.claimed ? (
                      <Badge variant="secondary">Claimed</Badge>
                    ) : (
                      <Badge variant="default">Available</Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-semibold">Rewards:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {reward.rewards.gold && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">💰</span>
                          <span>{reward.rewards.gold} Gold</span>
                        </div>
                      )}
                      {reward.rewards.gems && (
                        <div className="flex items-center gap-1">
                          <span className="text-blue-500">💎</span>
                          <span>{reward.rewards.gems} Gems</span>
                        </div>
                      )}
                      {reward.rewards.title && (
                        <div className="col-span-2 flex items-center gap-1">
                          <Crown className="h-3 w-3 text-purple-500" />
                          <span className="text-purple-500">{reward.rewards.title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!reward.claimed && (
                    <Button
                      onClick={() => handleClaimReward(reward)}
                      className="w-full"
                      size="sm"
                    >
                      Claim Rewards
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
