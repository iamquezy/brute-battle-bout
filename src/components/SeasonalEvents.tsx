import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Gift, Target, Clock, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SeasonalEvent {
  id: string;
  event_name: string;
  event_type: string;
  description: string;
  start_date: string;
  end_date: string;
  rewards: any;
  requirements: any;
  status: string;
}

interface EventParticipation {
  id: string;
  event_id: string;
  progress: any;
  rewards_claimed: boolean;
}

interface SeasonalEventsProps {
  userId: string;
  onBack: () => void;
}

export function SeasonalEvents({ userId, onBack }: SeasonalEventsProps) {
  const [activeEvents, setActiveEvents] = useState<SeasonalEvent[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, EventParticipation>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [userId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      const { data: events, error } = await supabase
        .from('seasonal_events')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true });

      if (error) throw error;

      setActiveEvents(events || []);

      // Load user progress for each event
      if (events && events.length > 0) {
        const { data: progressData } = await supabase
          .from('seasonal_event_participants')
          .select('*')
          .eq('user_id', userId)
          .in('event_id', events.map(e => e.id));

        const progressMap = new Map();
        progressData?.forEach(p => {
          progressMap.set(p.event_id, p);
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('seasonal_event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          progress: {}
        });

      if (error) throw error;

      toast.success('Joined event!');
      loadEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const handleClaimRewards = async (event: SeasonalEvent, participation: EventParticipation) => {
    try {
      const { error } = await supabase
        .from('seasonal_event_participants')
        .update({ rewards_claimed: true })
        .eq('id', participation.id);

      if (error) throw error;

      toast.success('Rewards claimed!', {
        description: `You received: ${JSON.stringify(event.rewards)}`
      });
      loadEvents();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'pvp': return 'destructive';
      case 'pve': return 'default';
      case 'collection': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          Back to Hub
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Calendar className="h-8 w-8 text-primary" />
              Seasonal Events
            </CardTitle>
            <CardDescription>
              Time-limited events with exclusive rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : activeEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Active Events</h3>
                <p className="text-muted-foreground">
                  Check back soon for new seasonal events!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {activeEvents.map((event) => {
                    const participation = userProgress.get(event.id);
                    const isParticipating = !!participation;
                    const progressPercent = participation?.progress?.completed || 0;

                    return (
                      <Card key={event.id} className="overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/20 to-transparent p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-2xl font-bold">{event.event_name}</h3>
                                <Badge variant={getEventBadgeColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{event.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{getTimeRemaining(event.end_date)} remaining</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Requirements */}
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Objectives
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(event.requirements).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between text-sm bg-background/50 p-2 rounded">
                                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                  <Badge variant="outline">{String(value)}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rewards */}
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Gift className="h-4 w-4" />
                              Rewards
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(event.rewards).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-1 bg-background/50 p-2 rounded">
                                  <Trophy className="h-3 w-3 text-yellow-500" />
                                  <span className="capitalize">{key}: {String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Progress */}
                          {isParticipating && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <Progress value={progressPercent} className="h-2" />
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {!isParticipating ? (
                              <Button onClick={() => handleJoinEvent(event.id)} className="w-full">
                                Join Event
                              </Button>
                            ) : participation.rewards_claimed ? (
                              <Badge variant="secondary" className="w-full justify-center py-2">
                                Rewards Claimed
                              </Badge>
                            ) : progressPercent >= 100 ? (
                              <Button 
                                onClick={() => handleClaimRewards(event, participation)}
                                className="w-full"
                                variant="default"
                              >
                                <Gift className="h-4 w-4 mr-2" />
                                Claim Rewards
                              </Button>
                            ) : (
                              <Badge variant="outline" className="w-full justify-center py-2">
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
