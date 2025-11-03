import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Trophy, Shield, Swords, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Territory {
  territory_id: string;
  guild_id: string | null;
  captured_at: string;
  defense_wins: number;
  challenge_cooldown: string | null;
  guild?: {
    name: string;
    level: number;
  };
}

interface TerritoryControlProps {
  userId: string;
  userGuildId: string | null;
  isGuildLeader: boolean;
  onBack: () => void;
}

export function TerritoryControl({ userId, userGuildId, isGuildLeader, onBack }: TerritoryControlProps) {
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTerritory();
  }, []);

  const loadTerritory = async () => {
    try {
      const { data, error } = await supabase
        .from('territory_control')
        .select('*')
        .eq('territory_id', 'stone_coliseum')
        .single();

      if (!error && data) {
        // Get guild data separately if there's a guild_id
        if (data.guild_id) {
          const { data: guild } = await supabase
            .from('guilds')
            .select('name, level')
            .eq('id', data.guild_id)
            .single();

          setTerritory({ ...data, guild } as Territory);
        } else {
          setTerritory(data as Territory);
        }
      }
    } catch (error) {
      console.error('Error loading territory:', error);
    }
  };

  const handleChallenge = async () => {
    if (!userGuildId || !isGuildLeader) {
      toast.error('Only guild leaders can challenge for territory');
      return;
    }

    if (!territory) return;

    // Check cooldown
    if (territory.challenge_cooldown) {
      const cooldown = new Date(territory.challenge_cooldown);
      const now = new Date();
      
      if (cooldown > now) {
        const hoursLeft = Math.ceil((cooldown.getTime() - now.getTime()) / (1000 * 60 * 60));
        toast.error(`Territory is under protection for ${hoursLeft} more hours`);
        return;
      }
    }

    setLoading(true);
    try {
      // TODO: Start territory challenge war (3v3 or 5v5 matches)
      toast.info('Territory challenge system coming soon!');
      toast('Your guild will need to win 3 out of 5 matches to claim the territory');
    } catch (error) {
      toast.error('Failed to challenge for territory');
    } finally {
      setLoading(false);
    }
  };

  const getDaysHeld = () => {
    if (!territory?.captured_at) return 0;
    const captured = new Date(territory.captured_at);
    const now = new Date();
    const diff = now.getTime() - captured.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const isOurTerritory = territory?.guild_id === userGuildId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Flag className="h-8 w-8 text-primary" />
                Territory Control
              </CardTitle>
              <CardDescription>Claim and defend the Stone Coliseum</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to Hub
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Territory Card */}
          <Card className={`border-2 ${isOurTerritory ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">🏛️</div>
                <h2 className="text-2xl font-bold">Stone Coliseum</h2>
                
                {territory?.guild_id ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      <span className="text-lg">Controlled by</span>
                    </div>
                    <Badge className="text-xl px-6 py-2">
                      {territory.guild?.name || 'Unknown Guild'}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Held for {getDaysHeld()} days • Level {territory.guild?.level || 1} Guild
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Defense Record: {territory.defense_wins} successful defenses
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="text-xl px-6 py-2">
                      Unclaimed
                    </Badge>
                    <p className="text-muted-foreground">
                      No guild currently controls this territory
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Territory Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>+10% XP for all guild members</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Exclusive guild banner displayed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Weekly gold bonus for guild treasury</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>Territory holder title for guild leader</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenge Section */}
          {userGuildId && !isOurTerritory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-destructive" />
                  Challenge for Territory
                </CardTitle>
                <CardDescription>
                  Win 3 out of 5 matches to claim the Stone Coliseum
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGuildLeader ? (
                  <Button
                    onClick={handleChallenge}
                    disabled={loading}
                    className="w-full bg-gradient-gold"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Challenge Territory
                  </Button>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Only guild leaders can challenge for territory
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Defense Section */}
          {isOurTerritory && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Your Guild Controls This Territory
                </CardTitle>
                <CardDescription>
                  Defend against challenges to maintain control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-primary">
                    {territory?.defense_wins || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Successful Defenses
                  </div>
                  {territory?.challenge_cooldown && new Date(territory.challenge_cooldown) > new Date() && (
                    <Badge variant="outline">
                      Protected for {Math.ceil((new Date(territory.challenge_cooldown).getTime() - Date.now()) / (1000 * 60 * 60))} hours
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!userGuildId && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You must be in a guild to participate in territory control</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
