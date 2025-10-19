import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CharacterClass } from '@/types/game';
import { PRE_MADE_FIGHTERS } from '@/types/fighters';
import { Sword, Wand2, Target, Shield, Zap, Heart } from 'lucide-react';

interface CharacterCreationProps {
  onCreateCharacter: (name: string, characterClass: CharacterClass) => void;
}

const CLASS_ICONS = {
  fighter: Sword,
  mage: Wand2,
  archer: Target,
};

const CLASS_STATS = {
  fighter: { attack: 15, defense: 12, speed: 8, health: 120, evasion: 5, critChance: 10, luck: 5 },
  mage: { attack: 20, defense: 6, speed: 10, health: 80, evasion: 8, critChance: 15, luck: 7 },
  archer: { attack: 18, defense: 8, speed: 14, health: 100, evasion: 12, critChance: 20, luck: 10 },
};

export function CharacterCreation({ onCreateCharacter }: CharacterCreationProps) {
  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);

  const handleSelectFighter = (fighterId: string) => {
    const fighter = PRE_MADE_FIGHTERS.find(f => f.id === fighterId);
    if (fighter) {
      onCreateCharacter(fighter.title, fighter.class);
    }
  };

  const getClassGradient = (cls: CharacterClass) => {
    switch (cls) {
      case 'fighter': return 'bg-gradient-fighter';
      case 'mage': return 'bg-gradient-mage';
      case 'archer': return 'bg-gradient-archer';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-arena flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
            Choose Your Fighter
          </h1>
          <p className="text-muted-foreground text-lg">Select your champion and enter the arena</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRE_MADE_FIGHTERS.map((fighter) => {
            const Icon = CLASS_ICONS[fighter.class];
            const stats = CLASS_STATS[fighter.class];
            const isSelected = selectedFighter === fighter.id;
            
            return (
              <Card
                key={fighter.id}
                className={`
                  p-6 cursor-pointer transition-all duration-300 border-2
                  ${isSelected 
                    ? 'border-primary shadow-glow shadow-primary scale-105' 
                    : 'border-border hover:border-primary/50 hover:scale-102'
                  }
                `}
                onClick={() => setSelectedFighter(fighter.id)}
              >
                <div className="flex flex-col gap-4">
                  <div className={`
                    w-24 h-24 mx-auto rounded-full ${getClassGradient(fighter.class)} 
                    flex items-center justify-center animate-glow-pulse
                  `}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {fighter.name}
                    </h3>
                    <p className="text-sm text-primary font-semibold mb-2">
                      {fighter.title}
                    </p>
                    <p className="text-sm text-muted-foreground italic mb-3">
                      {fighter.description}
                    </p>
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Sword className="w-3 h-3 text-primary" />
                        <span>Attack</span>
                      </div>
                      <span className="font-bold">{stats.attack}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-primary" />
                        <span>Defense</span>
                      </div>
                      <span className="font-bold">{stats.defense}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-primary" />
                        <span>Speed</span>
                      </div>
                      <span className="font-bold">{stats.speed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-destructive" />
                        <span>Health</span>
                      </div>
                      <span className="font-bold">{stats.health}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                    {fighter.backstory}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={() => selectedFighter && handleSelectFighter(selectedFighter)}
          disabled={!selectedFighter}
          className="w-full h-14 text-lg font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mt-8"
        >
          Enter the Arena
        </Button>
      </Card>
    </div>
  );
}
