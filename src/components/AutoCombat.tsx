import { useState, useEffect, useRef } from 'react';
import { Character } from '@/types/game';
import { createEnemyCharacter, DifficultyTier } from '@/lib/gameLogic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Zap, Shield, Sword, Trophy, X, SkipForward, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// Arena backgrounds
import arenaStone from '@/assets/arenas/arena-stone.jpg';
import arenaForest from '@/assets/arenas/arena-forest.jpg';
import arenaDesert from '@/assets/arenas/arena-desert.jpg';
import arenaIce from '@/assets/arenas/arena-ice.jpg';
import arenaVolcano from '@/assets/arenas/arena-volcano.jpg';

import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';
import opponentWarrior from '@/assets/avatars/opponent-warrior.png';
import opponentMage from '@/assets/avatars/opponent-mage.png';
import opponentArcher from '@/assets/avatars/opponent-archer.png';

const ARENAS = [arenaStone, arenaForest, arenaDesert, arenaIce, arenaVolcano];

interface CombatAction {
  attacker: 'player' | 'enemy';
  damage: number;
  isCrit: boolean;
  isEvaded: boolean;
  attackerHealth: number;
  defenderHealth: number;
  message: string;
}

interface AutoCombatProps {
  player: Character;
  opponentId?: string;
  difficulty?: DifficultyTier;
  onCombatEnd: (
    victory: boolean,
    expGained: number,
    goldGained: number,
    opponentName?: string,
    stats?: { damageDealt: number; critsLanded: number; perfectTimings: number }
  ) => void;
}

// Deterministic combat simulation
function simulateCombat(player: Character, enemy: Character): CombatAction[] {
  const actions: CombatAction[] = [];
  let playerHealth = player.stats.health;
  let enemyHealth = enemy.stats.health;
  
  // Determine first attacker by speed
  let isPlayerTurn = player.stats.speed >= enemy.stats.speed;
  
  const maxTurns = 50;
  let turn = 0;
  
  while (playerHealth > 0 && enemyHealth > 0 && turn < maxTurns) {
    turn++;
    const attacker = isPlayerTurn ? player : enemy;
    const defender = isPlayerTurn ? enemy : player;
    const defenderHealth = isPlayerTurn ? enemyHealth : playerHealth;
    
    // Calculate evasion
    const evasionChance = defender.stats.evasion + (defender.stats.luck * 0.3);
    const isEvaded = Math.random() * 100 < evasionChance;
    
    // Calculate damage
    let damage = 0;
    let isCrit = false;
    
    if (!isEvaded) {
      const baseDamage = attacker.stats.attack;
      const defense = defender.stats.defense;
      const randomFactor = 0.85 + Math.random() * 0.3;
      damage = Math.max(1, Math.floor((baseDamage - defense * 0.4) * randomFactor));
      
      // Check crit
      const critChance = attacker.stats.critChance + (attacker.stats.luck * 0.3);
      isCrit = Math.random() * 100 < critChance;
      if (isCrit) damage = Math.floor(damage * 1.8);
      
      // Apply damage
      if (isPlayerTurn) {
        enemyHealth = Math.max(0, enemyHealth - damage);
      } else {
        playerHealth = Math.max(0, playerHealth - damage);
      }
    }
    
    // Create message
    let message = '';
    if (isEvaded) {
      message = `${defender.name} dodges!`;
    } else if (isCrit) {
      message = `${attacker.name} lands a CRITICAL HIT for ${damage}!`;
    } else {
      message = `${attacker.name} deals ${damage} damage`;
    }
    
    actions.push({
      attacker: isPlayerTurn ? 'player' : 'enemy',
      damage: isEvaded ? 0 : damage,
      isCrit,
      isEvaded,
      attackerHealth: isPlayerTurn ? playerHealth : enemyHealth,
      defenderHealth: isPlayerTurn ? enemyHealth : playerHealth,
      message,
    });
    
    isPlayerTurn = !isPlayerTurn;
  }
  
  return actions;
}

export function AutoCombat({ player, opponentId, difficulty = 'normal', onCombatEnd }: AutoCombatProps) {
  const [arena] = useState(() => ARENAS[Math.floor(Math.random() * ARENAS.length)]);
  const [enemy] = useState(() => createEnemyCharacter(player.level, opponentId, difficulty));
  const [combatActions] = useState(() => simulateCombat(player, enemy));
  
  const [currentActionIndex, setCurrentActionIndex] = useState(-1);
  const [playerHealth, setPlayerHealth] = useState(player.stats.health);
  const [enemyHealth, setEnemyHealth] = useState(enemy.stats.health);
  const [isPlaying, setIsPlaying] = useState(true);
  const [combatEnded, setCombatEnded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [playerAnimating, setPlayerAnimating] = useState(false);
  const [enemyAnimating, setEnemyAnimating] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{id: number; value: number; isPlayer: boolean; isCrit: boolean}[]>([]);
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const damageIdRef = useRef(0);

  const getAvatarForClass = (characterClass: string, isEnemy = false) => {
    if (isEnemy) {
      switch (characterClass) {
        case 'fighter': return opponentWarrior;
        case 'mage': return opponentMage;
        case 'archer': return opponentArcher;
        default: return opponentWarrior;
      }
    }
    switch (characterClass) {
      case 'fighter': return warriorAvatar;
      case 'mage': return mageAvatar;
      case 'archer': return archerAvatar;
      default: return warriorAvatar;
    }
  };

  const getClassColor = (characterClass: string) => {
    switch (characterClass) {
      case 'fighter': return 'from-fighter/20 to-fighter/5 border-fighter/30';
      case 'mage': return 'from-mage/20 to-mage/5 border-mage/30';
      case 'archer': return 'from-archer/20 to-archer/5 border-archer/30';
      default: return 'from-primary/20 to-primary/5 border-primary/30';
    }
  };

  const playNextAction = () => {
    if (currentActionIndex >= combatActions.length - 1) {
      setCombatEnded(true);
      setIsPlaying(false);
      setTimeout(() => setShowResult(true), 500);
      return;
    }

    const nextIndex = currentActionIndex + 1;
    const action = combatActions[nextIndex];
    
    // Trigger animation
    if (action.attacker === 'player') {
      setPlayerAnimating(true);
      setTimeout(() => setPlayerAnimating(false), 500);
    } else {
      setEnemyAnimating(true);
      setTimeout(() => setEnemyAnimating(false), 500);
    }

    // Show damage number
    if (!action.isEvaded) {
      const newDamage = {
        id: damageIdRef.current++,
        value: action.damage,
        isPlayer: action.attacker === 'enemy',
        isCrit: action.isCrit,
      };
      setDamageNumbers(prev => [...prev, newDamage]);
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== newDamage.id));
      }, 1000);
    }

    // Update health after animation
    setTimeout(() => {
      if (action.attacker === 'player') {
        setEnemyHealth(action.defenderHealth);
      } else {
        setPlayerHealth(action.defenderHealth);
      }
    }, 300);

    setCurrentActionIndex(nextIndex);
  };

  useEffect(() => {
    if (isPlaying && !combatEnded) {
      animationRef.current = setTimeout(playNextAction, 800);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [currentActionIndex, isPlaying, combatEnded]);

  // Start combat automatically
  useEffect(() => {
    const startTimer = setTimeout(() => {
      playNextAction();
    }, 1000);
    return () => clearTimeout(startTimer);
  }, []);

  const skipToEnd = () => {
    const lastAction = combatActions[combatActions.length - 1];
    setCurrentActionIndex(combatActions.length - 1);
    setPlayerHealth(lastAction.attacker === 'enemy' ? lastAction.defenderHealth : lastAction.attackerHealth);
    setEnemyHealth(lastAction.attacker === 'player' ? lastAction.defenderHealth : lastAction.attackerHealth);
    setCombatEnded(true);
    setIsPlaying(false);
    setTimeout(() => setShowResult(true), 300);
  };

  const handleContinue = () => {
    const victory = enemyHealth <= 0;
    const totalDamage = combatActions
      .filter(a => a.attacker === 'player' && !a.isEvaded)
      .reduce((sum, a) => sum + a.damage, 0);
    const critsLanded = combatActions.filter(a => a.attacker === 'player' && a.isCrit).length;
    
    // Calculate rewards based on difficulty
    const difficultyMultipliers: Record<DifficultyTier, number> = {
      easy: 0.75, normal: 1, hard: 1.5, brutal: 2
    };
    const multiplier = difficultyMultipliers[difficulty];
    
    const baseExp = 20 + enemy.level * 10;
    const baseGold = 10 + enemy.level * 5;
    const expGained = victory ? Math.floor(baseExp * multiplier) : Math.floor(baseExp * 0.2);
    const goldGained = victory ? Math.floor(baseGold * multiplier) : Math.floor(baseGold * 0.1);
    
    onCombatEnd(victory, expGained, goldGained, enemy.name, {
      damageDealt: totalDamage,
      critsLanded,
      perfectTimings: 0,
    });
  };

  const currentAction = currentActionIndex >= 0 ? combatActions[currentActionIndex] : null;
  const victory = enemyHealth <= 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Arena Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${arena})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/90" />
      </div>

      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Combat Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Arena Battle</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={combatEnded}
              className="bg-card/80"
            >
              {isPlaying ? <Eye className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={skipToEnd}
              disabled={combatEnded}
              className="bg-card/80"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>

        {/* Combat Arena */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Player Side */}
          <Card className={cn(
            "p-4 bg-gradient-to-br border transition-all duration-300 relative overflow-hidden",
            getClassColor(player.class),
            playerAnimating && "animate-move-to-enemy"
          )}>
            {/* Damage numbers on player */}
            {damageNumbers.filter(d => d.isPlayer).map(d => (
              <div 
                key={d.id}
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 text-2xl font-bold animate-damage-number z-20",
                  d.isCrit ? "text-primary text-3xl" : "text-destructive"
                )}
              >
                -{d.value}
                {d.isCrit && <span className="text-xs ml-1">CRIT!</span>}
              </div>
            ))}
            
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-16 h-16 rounded-full overflow-hidden border-2",
                player.class === 'fighter' ? 'border-fighter' : 
                player.class === 'mage' ? 'border-mage' : 'border-archer'
              )}>
                <img src={getAvatarForClass(player.class)} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{player.name}</h3>
                <p className="text-sm text-muted-foreground">Level {player.level} {player.class}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" />
                <Progress 
                  value={(playerHealth / player.stats.maxHealth) * 100} 
                  className="h-3 flex-1"
                />
                <span className="text-sm font-medium w-16 text-right">
                  {playerHealth}/{player.stats.maxHealth}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3 text-primary" />
                  <span>{player.stats.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-accent" />
                  <span>{player.stats.defense}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-success" />
                  <span>{player.stats.speed}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Enemy Side */}
          <Card className={cn(
            "p-4 bg-gradient-to-br border transition-all duration-300 relative overflow-hidden",
            getClassColor(enemy.class),
            enemyAnimating && "animate-move-to-player"
          )}>
            {/* Damage numbers on enemy */}
            {damageNumbers.filter(d => !d.isPlayer).map(d => (
              <div 
                key={d.id}
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 text-2xl font-bold animate-damage-number z-20",
                  d.isCrit ? "text-primary text-3xl" : "text-destructive"
                )}
              >
                -{d.value}
                {d.isCrit && <span className="text-xs ml-1">CRIT!</span>}
              </div>
            ))}
            
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-16 h-16 rounded-full overflow-hidden border-2",
                enemy.class === 'fighter' ? 'border-fighter' : 
                enemy.class === 'mage' ? 'border-mage' : 'border-archer'
              )}>
                <img src={getAvatarForClass(enemy.class, true)} alt={enemy.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{enemy.name}</h3>
                <p className="text-sm text-muted-foreground">Level {enemy.level} {enemy.class}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" />
                <Progress 
                  value={(enemyHealth / enemy.stats.maxHealth) * 100} 
                  className="h-3 flex-1"
                />
                <span className="text-sm font-medium w-16 text-right">
                  {enemyHealth}/{enemy.stats.maxHealth}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3 text-primary" />
                  <span>{enemy.stats.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-accent" />
                  <span>{enemy.stats.defense}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-success" />
                  <span>{enemy.stats.speed}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Combat Log */}
        <Card className="p-4 bg-card/90 backdrop-blur-sm mb-4">
          <div className="h-24 overflow-y-auto styled-scrollbar">
            {currentAction ? (
              <div className={cn(
                "p-2 rounded text-center animate-slide-in",
                currentAction.attacker === 'player' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}>
                <span className="font-medium">{currentAction.message}</span>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Combat starting...
              </div>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Turn {Math.max(0, currentActionIndex + 1)}</span>
              <span>{combatActions.length} total</span>
            </div>
            <Progress 
              value={((currentActionIndex + 1) / combatActions.length) * 100} 
              className="h-1"
            />
          </div>
        </Card>

        {/* Result Modal */}
        {showResult && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-up">
            <Card className={cn(
              "p-8 max-w-md w-full mx-4 text-center",
              victory ? "border-success/50" : "border-destructive/50"
            )}>
              <div className={cn(
                "w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center",
                victory ? "bg-success/20" : "bg-destructive/20"
              )}>
                {victory ? (
                  <Trophy className="w-10 h-10 text-success" />
                ) : (
                  <X className="w-10 h-10 text-destructive" />
                )}
              </div>
              
              <h2 className={cn(
                "text-3xl font-bold mb-2",
                victory ? "text-success" : "text-destructive"
              )}>
                {victory ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              
              <p className="text-muted-foreground mb-6">
                {victory 
                  ? `You defeated ${enemy.name}!`
                  : `${enemy.name} was too strong...`
                }
              </p>
              
              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
