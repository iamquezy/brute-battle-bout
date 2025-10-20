import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Achievement, Title, AchievementTier } from '@/types/achievements';
import { Trophy, Award, Medal, Crown, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AchievementsProps {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
  titles: Record<string, Title>;
  currentTitle: string | null;
  onEquipTitle: (titleId: string) => void;
  onUnequipTitle: () => void;
}

const getTierIcon = (tier: AchievementTier) => {
  switch (tier) {
    case 'bronze': return <Medal className="w-5 h-5 text-orange-600" />;
    case 'silver': return <Medal className="w-5 h-5 text-gray-400" />;
    case 'gold': return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'platinum': return <Crown className="w-5 h-5 text-purple-500" />;
  }
};

const getTierColor = (tier: AchievementTier) => {
  switch (tier) {
    case 'bronze': return 'bg-orange-600/20 border-orange-600/50';
    case 'silver': return 'bg-gray-400/20 border-gray-400/50';
    case 'gold': return 'bg-yellow-500/20 border-yellow-500/50';
    case 'platinum': return 'bg-purple-500/20 border-purple-500/50';
  }
};

export const Achievements = ({ 
  open, 
  onClose, 
  achievements,
  titles,
  currentTitle,
  onEquipTitle,
  onUnequipTitle
}: AchievementsProps) => {
  const categorizedAchievements = {
    combat: achievements.filter(a => a.category === 'combat'),
    progression: achievements.filter(a => a.category === 'progression'),
    collection: achievements.filter(a => a.category === 'collection'),
    mastery: achievements.filter(a => a.category === 'mastery'),
  };

  const unlockedTitles = achievements
    .filter(a => a.completed && a.unlocksTitle)
    .map(a => a.unlocksTitle!)
    .filter(titleId => titles[titleId]);

  const renderAchievement = (achievement: Achievement) => {
    const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);
    
    return (
      <Card 
        key={achievement.id}
        className={`p-4 ${achievement.completed ? getTierColor(achievement.tier) : 'border-border opacity-60'}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {achievement.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              getTierIcon(achievement.tier)
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold">{achievement.name}</h3>
              <Badge variant="outline" className="text-xs capitalize">
                {achievement.tier}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>
            
            {!achievement.completed && (
              <>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold">{achievement.progress} / {achievement.requirement}</span>
                </div>
                <Progress value={progressPercent} className="h-1" />
              </>
            )}
            
            {achievement.unlocksTitle && titles[achievement.unlocksTitle] && (
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">Unlocks Title: </span>
                <span 
                  className="font-bold"
                  style={{ color: titles[achievement.unlocksTitle].color }}
                >
                  {titles[achievement.unlocksTitle].name}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            Achievements & Titles
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="achievements" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="titles">Titles ({unlockedTitles.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="flex-1 overflow-y-auto">
            <Tabs defaultValue="all" className="flex flex-col">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="combat">Combat</TabsTrigger>
                <TabsTrigger value="progression">Progress</TabsTrigger>
                <TabsTrigger value="collection">Collection</TabsTrigger>
                <TabsTrigger value="mastery">Mastery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-3 pr-2">
                {achievements.map(renderAchievement)}
              </TabsContent>
              
              <TabsContent value="combat" className="space-y-3 pr-2">
                {categorizedAchievements.combat.map(renderAchievement)}
              </TabsContent>
              
              <TabsContent value="progression" className="space-y-3 pr-2">
                {categorizedAchievements.progression.map(renderAchievement)}
              </TabsContent>
              
              <TabsContent value="collection" className="space-y-3 pr-2">
                {categorizedAchievements.collection.map(renderAchievement)}
              </TabsContent>
              
              <TabsContent value="mastery" className="space-y-3 pr-2">
                {categorizedAchievements.mastery.map(renderAchievement)}
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          <TabsContent value="titles" className="flex-1 overflow-y-auto space-y-3 pr-2">
            {unlockedTitles.length === 0 ? (
              <Card className="p-8 text-center">
                <Crown className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Complete achievements to unlock titles!
                </p>
              </Card>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Current Title</h3>
                  {currentTitle && titles[currentTitle] ? (
                    <Card className="p-4 flex items-center justify-between">
                      <div>
                        <span 
                          className="text-xl font-bold"
                          style={{ color: titles[currentTitle].color }}
                        >
                          {titles[currentTitle].name}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {titles[currentTitle].description}
                        </p>
                      </div>
                      <Button variant="outline" onClick={onUnequipTitle}>
                        Unequip
                      </Button>
                    </Card>
                  ) : (
                    <Card className="p-4 text-center text-muted-foreground">
                      No title equipped
                    </Card>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-2">Unlocked Titles</h3>
                  <div className="space-y-2">
                    {unlockedTitles.map(titleId => {
                      const title = titles[titleId];
                      const isEquipped = currentTitle === titleId;
                      
                      return (
                        <Card 
                          key={titleId}
                          className={`p-4 flex items-center justify-between ${
                            isEquipped ? 'border-primary border-2' : ''
                          }`}
                        >
                          <div>
                            <span 
                              className="text-lg font-bold"
                              style={{ color: title.color }}
                            >
                              {title.name}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {title.description}
                            </p>
                          </div>
                          {!isEquipped && (
                            <Button 
                              variant="outline"
                              onClick={() => onEquipTitle(titleId)}
                            >
                              Equip
                            </Button>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
