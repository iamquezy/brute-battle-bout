import { useState, useEffect, useCallback } from 'react';
import { Character, StatType } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Target, Dumbbell, Heart, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingGroundProps {
  player: Character;
  onBack: () => void;
  onStatGain: (stat: StatType, amount: number) => void;
  onGoldSpent: (amount: number) => void;
}

type MiniGame = 'reflex' | 'strength' | 'precision' | 'endurance';

export const TrainingGround = ({ player, onBack, onStatGain, onGoldSpent }: TrainingGroundProps) => {
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [clicks, setClicks] = useState(0);
  const [rapidTaps, setRapidTaps] = useState(0);
  
  const TRAINING_COST = 50;

  const games = [
    { 
      id: 'reflex' as MiniGame, 
      name: 'Reflex Training', 
      icon: Zap, 
      stat: 'speed' as StatType,
      description: 'Click targets quickly to improve speed',
      color: 'text-yellow-400'
    },
    { 
      id: 'strength' as MiniGame, 
      name: 'Strength Training', 
      icon: Dumbbell, 
      stat: 'attack' as StatType,
      description: 'Rapid tapping to build attack power',
      color: 'text-red-400'
    },
    { 
      id: 'precision' as MiniGame, 
      name: 'Precision Training', 
      icon: Target, 
      stat: 'attack' as StatType,
      description: 'Hit small targets for critical chance',
      color: 'text-blue-400'
    },
    { 
      id: 'endurance' as MiniGame, 
      name: 'Endurance Training', 
      icon: Heart, 
      stat: 'health' as StatType,
      description: 'Sustained clicking for health boost',
      color: 'text-green-400'
    },
  ];

  const moveTarget = useCallback(() => {
    setTargetPosition({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    });
  }, []);

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          endGame();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameActive]);

  const startGame = (game: MiniGame) => {
    if (player.gold < TRAINING_COST) {
      toast.error('Not enough gold!', { description: `Training costs ${TRAINING_COST} gold` });
      return;
    }

    setSelectedGame(game);
    setGameActive(true);
    setScore(0);
    setTimeLeft(10);
    setClicks(0);
    setRapidTaps(0);
    onGoldSpent(TRAINING_COST);
    moveTarget();
  };

  const endGame = () => {
    setGameActive(false);
    
    if (!selectedGame) return;

    const gameData = games.find(g => g.id === selectedGame);
    if (!gameData) return;

    // Calculate stat gain based on performance
    let statGain = 0;
    if (selectedGame === 'reflex' && score >= 8) statGain = 1;
    else if (selectedGame === 'strength' && rapidTaps >= 50) statGain = 1;
    else if (selectedGame === 'precision' && score >= 5) statGain = 1;
    else if (selectedGame === 'endurance' && clicks >= 30) statGain = 1;

    if (statGain > 0) {
      onStatGain(gameData.stat, statGain);
      toast.success(`Training Complete!`, {
        description: `+${statGain} ${gameData.stat}`,
      });
    } else {
      toast.info('Training Complete', {
        description: 'Keep practicing to improve!',
      });
    }

    setSelectedGame(null);
  };

  const handleTargetClick = () => {
    if (!gameActive) return;
    
    setScore(prev => prev + 1);
    setClicks(prev => prev + 1);
    moveTarget();
  };

  const handleRapidTap = () => {
    if (!gameActive || selectedGame !== 'strength') return;
    setRapidTaps(prev => prev + 1);
  };

  if (gameActive && selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-arena p-4">
        <Card className="max-w-4xl mx-auto p-6 bg-card/95 backdrop-blur-sm border-2 border-primary/30">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">
              {games.find(g => g.id === selectedGame)?.name}
            </h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Time Left</p>
              <p className="text-2xl font-bold text-primary">{timeLeft.toFixed(1)}s</p>
            </div>
          </div>

          <Progress value={(timeLeft / 10) * 100} className="mb-4" />

          <div className="mb-4">
            <p className="text-lg font-semibold text-foreground">
              Score: <span className="text-primary">{score}</span>
            </p>
            {selectedGame === 'strength' && (
              <p className="text-sm text-muted-foreground">Taps: {rapidTaps}</p>
            )}
            {selectedGame === 'endurance' && (
              <p className="text-sm text-muted-foreground">Clicks: {clicks}</p>
            )}
          </div>

          <div 
            className="relative bg-muted/20 rounded-lg border-2 border-primary/20 h-96 overflow-hidden"
            onClick={selectedGame === 'strength' ? handleRapidTap : undefined}
          >
            {(selectedGame === 'reflex' || selectedGame === 'precision') && (
              <button
                onClick={handleTargetClick}
                className={`absolute ${
                  selectedGame === 'precision' ? 'w-8 h-8' : 'w-16 h-16'
                } bg-destructive hover:bg-destructive/80 rounded-full flex items-center justify-center transition-all hover:scale-110 border-2 border-destructive-foreground shadow-lg cursor-pointer`}
                style={{
                  left: `${targetPosition.x}%`,
                  top: `${targetPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Target className="text-destructive-foreground" size={selectedGame === 'precision' ? 16 : 24} />
              </button>
            )}
            
            {selectedGame === 'strength' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-6xl font-bold text-primary mb-4">{rapidTaps}</p>
                  <p className="text-lg text-muted-foreground">Click anywhere rapidly!</p>
                </div>
              </div>
            )}

            {selectedGame === 'endurance' && (
              <div className="grid grid-cols-5 gap-4 p-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setClicks(prev => prev + 1)}
                    className="aspect-square bg-primary/20 hover:bg-primary/40 rounded-lg flex items-center justify-center transition-all hover:scale-105 border-2 border-primary/30"
                  >
                    <Heart className="text-primary" size={24} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-arena p-4">
      <Card className="max-w-4xl mx-auto p-6 bg-card/95 backdrop-blur-sm border-2 border-primary/30">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="text-primary" />
              Training Ground
            </h1>
            <p className="text-muted-foreground mt-2">
              Improve your stats through mini-games
            </p>
          </div>
          <Button onClick={onBack} variant="outline">
            Back to Hub
          </Button>
        </div>

        <div className="mb-6 p-4 bg-muted/20 rounded-lg border-2 border-primary/20">
          <p className="text-foreground font-semibold mb-2">Your Gold: {player.gold}</p>
          <p className="text-sm text-muted-foreground">
            Each training session costs {TRAINING_COST} gold and lasts 10 seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map(game => {
            const Icon = game.icon;
            return (
              <Card 
                key={game.id}
                className="p-6 bg-card/60 border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                onClick={() => startGame(game.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-primary/10 ${game.color}`}>
                    <Icon size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {game.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Improves: {game.stat}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {TRAINING_COST} gold
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/10 rounded-lg border border-primary/10">
          <h3 className="font-bold text-foreground mb-2">How to Train</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Each mini-game tests different skills</li>
            <li>• Score well to gain permanent stat bonuses</li>
            <li>• Higher scores = better rewards</li>
            <li>• Train regularly to become stronger</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
