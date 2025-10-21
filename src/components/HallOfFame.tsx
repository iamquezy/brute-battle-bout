import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getHallOfFame, HALL_OF_FAME_CATEGORIES, HallOfFameEntry } from '@/lib/hallOfFame';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';

interface HallOfFameProps {
  onBack: () => void;
}

export function HallOfFame({ onBack }: HallOfFameProps) {
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<HallOfFameEntry['category']>('legendary_warrior');

  useEffect(() => {
    loadHallOfFame();
  }, []);

  const loadHallOfFame = async () => {
    const data = await getHallOfFame();
    setHallOfFame(data);
  };

  const filteredEntries = hallOfFame.filter(entry => entry.category === activeCategory);
  const categoryInfo = HALL_OF_FAME_CATEGORIES[activeCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-yellow-500/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hub
        </Button>

        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Hall of Fame
            </CardTitle>
            <CardDescription>
              Legendary players who achieved greatness
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(HALL_OF_FAME_CATEGORIES).map(([key, info]) => (
              <TabsTrigger key={key} value={key}>
                <span className="mr-1">{info.icon}</span>
                <span className="hidden sm:inline">{info.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  {categoryInfo.name}
                </CardTitle>
                <CardDescription>
                  {categoryInfo.description}
                </CardDescription>
                <Badge variant="outline" className="w-fit mt-2">
                  Requirement: {categoryInfo.requirement}
                </Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No legends yet. Be the first to achieve this honor!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEntries.map((entry, index) => (
                        <Card key={entry.id} className={index < 3 ? 'border-yellow-500/50' : ''}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`text-2xl font-bold ${
                                  index === 0 ? 'text-yellow-500' :
                                  index === 1 ? 'text-slate-400' :
                                  index === 2 ? 'text-orange-600' :
                                  'text-muted-foreground'
                                }`}>
                                  #{index + 1}
                                </div>
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="text-lg">
                                    {entry.username[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="font-bold text-lg">{entry.username}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Inducted: {new Date(entry.recorded_at).toLocaleDateString()}
                                  </div>
                                  {entry.achievement_data && (
                                    <div className="mt-2 space-y-1">
                                      {Object.entries(entry.achievement_data).map(([key, value]) => (
                                        <div key={key} className="text-sm">
                                          <span className="text-muted-foreground capitalize">
                                            {key.replace(/_/g, ' ')}:
                                          </span>{' '}
                                          <span className="font-semibold">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {index < 3 && (
                                <Trophy className={`h-6 w-6 ${
                                  index === 0 ? 'text-yellow-500' :
                                  index === 1 ? 'text-slate-400' :
                                  'text-orange-600'
                                }`} />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* All Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(HALL_OF_FAME_CATEGORIES).map(([key, info]) => {
                const count = hallOfFame.filter(e => e.category === key).length;
                return (
                  <Card key={key} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            <span className="text-xl">{info.icon}</span>
                            {info.name}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {info.requirement}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {count} {count === 1 ? 'Legend' : 'Legends'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
