import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CharacterClass } from '@/types/game';
import { Swords, Wand2, Target, Shield, Zap, Heart } from 'lucide-react';
import { CLASS_DESCRIPTIONS } from '@/lib/gameLogic';
import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';

interface CharacterCreationProps {
  onCreateCharacter: (name: string, characterClass: CharacterClass) => void;
}

const CLASS_STATS = {
  fighter: { attack: 15, defense: 12, speed: 8, health: 120, evasion: 5, critChance: 10, luck: 5 },
  mage: { attack: 20, defense: 6, speed: 10, health: 80, evasion: 8, critChance: 15, luck: 7 },
  archer: { attack: 18, defense: 8, speed: 14, health: 100, evasion: 12, critChance: 20, luck: 10 },
};

const CLASS_INFO = {
  fighter: {
    name: 'The Steel Wall',
    icon: Swords,
    avatar: warriorAvatar,
  },
  mage: {
    name: 'The Arcane Master',
    icon: Wand2,
    avatar: mageAvatar,
  },
  archer: {
    name: 'The Swift Arrow',
    icon: Target,
    avatar: archerAvatar,
  },
};

export function CharacterCreation({ onCreateCharacter }: CharacterCreationProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (selectedClass && name.trim()) {
      onCreateCharacter(name.trim(), selectedClass);
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
      <Card className="max-w-4xl w-full p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-gold bg-clip-text text-transparent animate-float">
          Create Your Warrior
        </h1>
        <p className="text-center text-muted-foreground mb-8">Choose your name and fighting style</p>
        
        {/* Name Input */}
        <div className="mb-8 max-w-md mx-auto">
          <Label htmlFor="name" className="text-lg mb-2 block">Warrior Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg h-12"
            maxLength={20}
          />
        </div>

        {/* Class Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(['fighter', 'mage', 'archer'] as CharacterClass[]).map((classType) => {
            const Icon = CLASS_INFO[classType].icon;
            const stats = CLASS_STATS[classType];
            const isSelected = selectedClass === classType;

            return (
              <Card
                key={classType}
                className={`
                  p-6 cursor-pointer transition-all hover:scale-105
                  ${isSelected 
                    ? 'border-4 border-primary shadow-glow shadow-primary' 
                    : 'border-2 border-border hover:border-primary/50'
                  }
                `}
                onClick={() => setSelectedClass(classType)}
              >
                <div className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <img 
                      src={CLASS_INFO[classType].avatar} 
                      alt={`${classType} avatar`}
                      className={`w-full h-full object-cover rounded-full border-4 ${
                        isSelected ? 'border-primary' : 'border-border'
                      } animate-glow-pulse`}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-1">{CLASS_INFO[classType].name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{classType}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">{CLASS_DESCRIPTIONS[classType]}</p>

                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Swords className="w-3 h-3 text-primary" />
                        <span>Attack</span>
                      </div>
                      <span className="font-bold">{stats.attack}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-primary" />
                        <span>Defense</span>
                      </div>
                      <span className="font-bold">{stats.defense}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-primary" />
                        <span>Speed</span>
                      </div>
                      <span className="font-bold">{stats.speed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-destructive" />
                        <span>Health</span>
                      </div>
                      <span className="font-bold">{stats.health}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedClass || !name.trim()}
          className="w-full mt-8 h-14 text-xl font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-all hover:scale-105 shadow-combat disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Begin Your Journey
        </Button>
      </Card>
    </div>
  );
}
