import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CharacterClass } from '@/types/game';
import { CLASS_DESCRIPTIONS } from '@/lib/gameLogic';
import { Sword, Wand2, Target } from 'lucide-react';

interface CharacterCreationProps {
  onCreateCharacter: (name: string, characterClass: CharacterClass) => void;
}

const CLASS_ICONS = {
  fighter: Sword,
  mage: Wand2,
  archer: Target,
};

export function CharacterCreation({ onCreateCharacter }: CharacterCreationProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);

  const handleSubmit = () => {
    if (name.trim() && selectedClass) {
      onCreateCharacter(name, selectedClass);
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
      <Card className="w-full max-w-4xl p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
            Create Your Champion
          </h1>
          <p className="text-muted-foreground text-lg">Choose your path to glory</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Character Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your warrior's name"
              className="text-lg bg-secondary/50 border-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-4 text-foreground">
              Choose Your Class
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['fighter', 'mage', 'archer'] as CharacterClass[]).map((cls) => {
                const Icon = CLASS_ICONS[cls];
                return (
                  <Card
                    key={cls}
                    className={`
                      p-6 cursor-pointer transition-all duration-300 border-2
                      ${selectedClass === cls 
                        ? 'border-primary shadow-glow shadow-primary scale-105' 
                        : 'border-border hover:border-primary/50 hover:scale-102'
                      }
                    `}
                    onClick={() => setSelectedClass(cls)}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`
                        w-20 h-20 rounded-full ${getClassGradient(cls)} 
                        flex items-center justify-center animate-glow-pulse
                      `}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold capitalize text-foreground">
                        {cls}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center">
                        {CLASS_DESCRIPTIONS[cls]}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !selectedClass}
            className="w-full h-14 text-lg font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Enter the Arena
          </Button>
        </div>
      </Card>
    </div>
  );
}
