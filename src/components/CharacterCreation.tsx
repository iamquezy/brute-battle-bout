import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CharacterClass } from '@/types/game';
import { Swords, Wand2, Target, Shield, Zap, Heart, Dices } from 'lucide-react';
import { CLASS_DESCRIPTIONS } from '@/lib/gameLogic';
import { generateNamesByClass } from '@/lib/nameGenerator';
import { PET_LIBRARY } from '@/lib/petData';
import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';
import arenaLogo from '@/assets/arena-legends-logo.png';

interface CharacterCreationProps {
  onCreateCharacter: (
    name: string, 
    characterClass: CharacterClass,
    statAllocation: { str: number; dex: number; int: number; vit: number },
    starterPetId: string
  ) => void;
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

const STARTER_PETS = PET_LIBRARY.filter(p => p.rarity === 'common').slice(0, 3);

export function CharacterCreation({ onCreateCharacter }: CharacterCreationProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [name, setName] = useState('');
  const [step, setStep] = useState<'class' | 'stats' | 'pet'>('class');
  const [statPoints, setStatPoints] = useState(5);
  const [stats, setStats] = useState({ str: 0, dex: 0, int: 0, vit: 0 });
  const [selectedPet, setSelectedPet] = useState<string | null>(null);

  const handleGenerateName = () => {
    if (selectedClass) {
      setName(generateNamesByClass(selectedClass));
    }
  };

  const handleStatChange = (stat: 'str' | 'dex' | 'int' | 'vit', delta: number) => {
    const newValue = stats[stat] + delta;
    if (newValue >= 0 && delta <= statPoints && delta >= -stats[stat]) {
      setStats({ ...stats, [stat]: newValue });
      setStatPoints(statPoints - delta);
    }
  };

  const handleSubmit = () => {
    if (selectedClass && name.trim() && selectedPet) {
      onCreateCharacter(name.trim(), selectedClass, stats, selectedPet);
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
        <div className="mb-6 flex justify-center">
          <img 
            src={arenaLogo} 
            alt="Arena of Legends" 
            className="w-full max-w-2xl h-auto animate-float"
          />
        </div>
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-gold bg-clip-text text-transparent">
          Create Your Warrior
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {step === 'class' && 'Choose your class'}
          {step === 'stats' && 'Allocate your stat points'}
          {step === 'pet' && 'Choose your starter companion'}
        </p>

        {/* Step 1: Class Selection */}
        {step === 'class' && (
          <>
            <div className="mb-8 max-w-md mx-auto">
              <Label htmlFor="name" className="text-lg mb-2 block">Choose a Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg h-12"
                  maxLength={20}
                />
                <Button
                  onClick={handleGenerateName}
                  variant="outline"
                  disabled={!selectedClass}
                  className="h-12"
                >
                  <Dices className="h-5 w-5" />
                </Button>
              </div>
            </div>

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
              onClick={() => setStep('stats')}
              disabled={!selectedClass || !name.trim()}
              className="w-full h-14 text-xl font-bold bg-gradient-gold"
            >
              Next: Allocate Stats
            </Button>
          </>
        )}

        {/* Step 2: Stat Allocation */}
        {step === 'stats' && (
          <>
            <Card className="p-6 mb-6 bg-secondary/50">
              <h3 className="font-bold text-xl mb-4 text-center">
                Stat Points Remaining: <span className="text-primary">{statPoints}</span>
              </h3>
              <div className="grid gap-4">
                {[
                  { key: 'str' as const, label: 'Strength', desc: '+2 Attack, +1 Health per point', icon: Swords },
                  { key: 'dex' as const, label: 'Dexterity', desc: '+2 Speed, +1% Crit per point', icon: Target },
                  { key: 'int' as const, label: 'Intelligence', desc: '+1.5 Attack, +1% Evasion per point', icon: Zap },
                  { key: 'vit' as const, label: 'Vitality', desc: '+10 Health, +1 Defense per point', icon: Heart }
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatChange(key, -1)}
                        disabled={stats[key] === 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-bold">{stats[key]}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatChange(key, 1)}
                        disabled={statPoints === 0}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('class')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep('pet')}
                disabled={statPoints > 0}
                className="flex-1 bg-gradient-gold"
              >
                Next: Choose Pet
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Pet Selection */}
        {step === 'pet' && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {STARTER_PETS.map((pet) => (
                <Card
                  key={pet.id}
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                    selectedPet === pet.id
                      ? 'border-4 border-primary shadow-glow shadow-primary'
                      : 'border-2 border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPet(pet.id)}
                >
                  <div className="text-center space-y-3">
                    <div className="text-6xl">{pet.emoji}</div>
                    <h3 className="font-bold text-lg">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">{pet.description}</p>
                    <div className="bg-secondary/50 rounded p-2 text-sm">
                      {pet.bonuses.attack && <div>+{pet.bonuses.attack} Attack</div>}
                      {pet.bonuses.expMultiplier && <div>+{((pet.bonuses.expMultiplier - 1) * 100).toFixed(0)}% XP</div>}
                      {pet.bonuses.luck && <div>+{pet.bonuses.luck} Luck</div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('stats')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedPet}
                className="flex-1 bg-gradient-gold"
              >
                Begin Your Journey
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
