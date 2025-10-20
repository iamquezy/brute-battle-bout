import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Quest } from '@/types/quests';
import { CheckCircle2, Clock, Trophy, Calendar, Target } from 'lucide-react';

interface QuestsProps {
  open: boolean;
  onClose: () => void;
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  achievementQuests: Quest[];
  onClaimReward: (questId: string) => void;
}

export const Quests = ({ 
  open, 
  onClose, 
  dailyQuests, 
  weeklyQuests, 
  achievementQuests,
  onClaimReward 
}: QuestsProps) => {
  const renderQuest = (quest: Quest) => {
    const progressPercent = (quest.progress / quest.target) * 100;
    const isComplete = quest.completed && !quest.claimed;
    
    return (
      <Card 
        key={quest.id} 
        className={`p-4 ${isComplete ? 'border-primary border-2 bg-primary/5' : 'border-border'}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{quest.name}</h3>
              {quest.claimed && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{quest.description}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold">{quest.progress} / {quest.target}</span>
          </div>
          
          <Progress value={progressPercent} className="h-2" />
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Reward: </span>
              {quest.reward.gold && <span className="text-primary font-bold">{quest.reward.gold} gold</span>}
              {quest.reward.exp && <span className="text-blue-400 font-bold ml-2">{quest.reward.exp} exp</span>}
              {quest.reward.item && <span className="text-purple-400 font-bold ml-2">{quest.reward.item} item</span>}
              {quest.reward.skillToken && <span className="text-green-400 font-bold ml-2">Skill Token</span>}
              {quest.reward.title && <span className="text-yellow-400 font-bold ml-2">Title</span>}
            </div>
            
            {isComplete ? (
              <Button 
                onClick={() => onClaimReward(quest.id)}
                size="sm"
                className="bg-primary"
              >
                Claim
              </Button>
            ) : quest.claimed ? (
              <span className="text-xs text-muted-foreground">Claimed</span>
            ) : null}
          </div>
        </div>
      </Card>
    );
  };

  const getTimeRemaining = (resetTime?: number) => {
    if (!resetTime) return '';
    const remaining = resetTime - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Quests
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="daily" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="flex-1 overflow-y-auto space-y-4 pr-2">
            {dailyQuests.length > 0 && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Resets in: {getTimeRemaining(dailyQuests[0].resetTime)}
              </div>
            )}
            {dailyQuests.map(renderQuest)}
          </TabsContent>
          
          <TabsContent value="weekly" className="flex-1 overflow-y-auto space-y-4 pr-2">
            {weeklyQuests.length > 0 && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Resets in: {getTimeRemaining(weeklyQuests[0].resetTime)}
              </div>
            )}
            {weeklyQuests.map(renderQuest)}
          </TabsContent>
          
          <TabsContent value="achievements" className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="text-sm text-muted-foreground mb-2">
              Permanent quests that reward titles and legendary items
            </div>
            {achievementQuests.map(renderQuest)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
