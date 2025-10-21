import { useState } from 'react';
import { Character } from '@/types/game';
import { BOSSES } from '@/lib/bossData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Skull, Swords, Shield, Zap, Lock } from 'lucide-react';

interface BossSelectionProps {
  player: Character;
  onSelectBoss: (bossId: string) => void;
  onBack: () => void;
}

export function BossSelection({ player, onSelectBoss, onBack }: BossSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/10 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hub
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Skull className="h-8 w-8 text-destructive" />
              Raid Bosses
            </CardTitle>
            <CardDescription>
              Challenge powerful bosses for legendary rewards
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {BOSSES.map((boss) => {
            const isLocked = player.level < boss.level - 5;
            
            return (
              <Card 
                key={boss.id} 
                className={`transition-all hover:shadow-lg ${isLocked ? 'opacity-60' : 'border-destructive/30'}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {isLocked && <Lock className="h-5 w-5" />}
                        {boss.name}
                      </CardTitle>
                      <CardDescription className="mt-2">{boss.description}</CardDescription>
                    </div>
                    <Badge variant={isLocked ? "outline" : "destructive"}>
                      Level {boss.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Swords className="h-4 w-4 text-destructive" />
                      <span className="text-muted-foreground">ATK:</span>
                      <span className="font-bold">{boss.attack}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">DEF:</span>
                      <span className="font-bold">{boss.defense}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-muted-foreground">SPD:</span>
                      <span className="font-bold">{boss.speed}</span>
                    </div>
                  </div>

                  {/* Abilities Preview */}
                  <div>
                    <div className="text-sm font-semibold mb-2">Signature Abilities</div>
                    <div className="space-y-1">
                      {boss.abilities.slice(0, 2).map((ability, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {ability.name}
                        </div>
                      ))}
                      {boss.abilities.length > 2 && (
                        <div className="text-sm text-muted-foreground">
                          • +{boss.abilities.length - 2} more...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rewards Preview */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-semibold mb-2">Rewards</div>
                    <div className="text-sm space-y-1">
                      <div>💰 {boss.rewards.gold} Gold</div>
                      <div>⭐ {boss.rewards.experience} EXP</div>
                      {boss.rewards.prestigePoints && (
                        <div>✨ {boss.rewards.prestigePoints} Prestige Points</div>
                      )}
                      {boss.rewards.cosmetics && boss.rewards.cosmetics.length > 0 && (
                        <div className="text-purple-500">🎨 Exclusive Cosmetics</div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => onSelectBoss(boss.id)}
                    disabled={isLocked}
                    className="w-full"
                    variant={isLocked ? "outline" : "destructive"}
                  >
                    {isLocked ? `Unlock at Level ${boss.level - 5}` : 'Challenge Boss'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
