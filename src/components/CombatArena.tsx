import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Character, CombatLog } from '@/types/game';
import { calculateDamage, createEnemyCharacter, determineFirstAttacker } from '@/lib/gameLogic';
import { Sword, Heart, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface CombatArenaProps {
  player: Character;
  opponentId?: string;
  onCombatEnd: (victory: boolean, expGained: number, opponentName?: string) => void;
}

export function CombatArena({ player, opponentId, onCombatEnd }: CombatArenaProps) {
  const [enemy, setEnemy] = useState<Character>(() => createEnemyCharacter(player.level, opponentId));
  const [playerHealth, setPlayerHealth] = useState(player.stats.health);
  const [enemyHealth, setEnemyHealth] = useState(enemy.stats.health);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy' | null>(null);
  const [combatStarted, setCombatStarted] = useState(false);

  const addLog = (message: string, type: CombatLog['type']) => {
    const log: CombatLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now(),
    };
    setCombatLogs((prev) => [log, ...prev].slice(0, 10));
  };

  const executeAttack = async (attacker: Character, defender: Character, isPlayer: boolean) => {
    setIsAttacking(true);
    
    const result = calculateDamage(attacker, defender);
    
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    if (result.isEvaded) {
      addLog(`${defender.name} evaded the attack!`, 'damage');
      toast.info('Attack evaded!');
    } else {
      const attackType = attacker.class === 'fighter' ? '⚔️ slashes' : 
                         attacker.class === 'mage' ? '✨ blasts' : 
                         '🏹 shoots';
      const critText = result.isCrit ? ' CRITICAL HIT!' : '';
      
      if (isPlayer) {
        setEnemyHealth((prev) => Math.max(0, prev - result.damage));
        addLog(`${attacker.name} ${attackType} for ${result.damage} damage!${critText}`, 'attack');
        if (result.isCrit) toast.success('Critical Hit!');
      } else {
        setPlayerHealth((prev) => Math.max(0, prev - result.damage));
        addLog(`${attacker.name} ${attackType} for ${result.damage} damage!${critText}`, 'damage');
        if (result.isCrit) toast.error('Enemy Critical Hit!');
      }
    }
    
    setIsAttacking(false);
  };

  const startCombat = () => {
    setCombatStarted(true);
    const firstAttacker = determineFirstAttacker(player, enemy);
    setCurrentTurn(firstAttacker);
    addLog('Combat begins!', 'attack');
    toast.success('The battle has begun!');
  };

  useEffect(() => {
    if (!combatStarted || !currentTurn || isAttacking) return;

    const timer = setTimeout(async () => {
      if (currentTurn === 'player') {
        await executeAttack(player, enemy, true);
        setCurrentTurn('enemy');
      } else {
        await executeAttack(enemy, player, false);
        setCurrentTurn('player');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentTurn, combatStarted, isAttacking]);

  useEffect(() => {
    if (playerHealth <= 0) {
      addLog('You have been defeated...', 'defeat');
      toast.error('Defeat!');
      setTimeout(() => onCombatEnd(false, 0, enemy.name), 1500);
    } else if (enemyHealth <= 0) {
      const expGained = enemy.level * 50 + 25;
      addLog(`Victory! Gained ${expGained} experience!`, 'victory');
      toast.success(`Victory! +${expGained} EXP`);
      setTimeout(() => onCombatEnd(true, expGained, enemy.name), 1500);
    }
  }, [playerHealth, enemyHealth]);

  const getClassColor = (cls: Character['class']) => {
    switch (cls) {
      case 'fighter': return 'text-fighter';
      case 'mage': return 'text-mage';
      case 'archer': return 'text-archer';
    }
  };

  const getClassGradient = (cls: Character['class']) => {
    switch (cls) {
      case 'fighter': return 'bg-gradient-fighter';
      case 'mage': return 'bg-gradient-mage';
      case 'archer': return 'bg-gradient-archer';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-arena p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Combat Arena */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Player */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${getClassColor(player.class)}`}>
                  {player.name}
                </h2>
                <p className="text-sm text-muted-foreground capitalize">
                  Level {player.level} {player.class}
                </p>
              </div>
              
              <div className={`
                w-32 h-32 mx-auto rounded-full ${getClassGradient(player.class)} 
                flex items-center justify-center text-6xl font-bold text-white
                ${isAttacking && currentTurn === 'player' ? 'animate-attack-slash' : ''}
                ${isAttacking && currentTurn === 'enemy' ? 'animate-hit-flash' : ''}
              `}>
                {player.name[0].toUpperCase()}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">HP:</span>
                  <span className="ml-auto font-bold">{playerHealth}/{player.stats.maxHealth}</span>
                </div>
                <Progress value={(playerHealth / player.stats.maxHealth) * 100} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3" />
                  <span>ATK: {player.stats.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>DEF: {player.stats.defense}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>SPD: {player.stats.speed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>EVA: {player.stats.evasion}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3 text-destructive" />
                  <span>CRIT: {player.stats.critChance}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span>LUCK: {player.stats.luck}</span>
                </div>
              </div>
            </div>

            {/* Enemy */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${getClassColor(enemy.class)}`}>
                  {enemy.name}
                </h2>
                <p className="text-sm text-muted-foreground capitalize">
                  Level {enemy.level} {enemy.class}
                </p>
              </div>
              
              <div className={`
                w-32 h-32 mx-auto rounded-full ${getClassGradient(enemy.class)} 
                flex items-center justify-center text-6xl font-bold text-white
                ${isAttacking && currentTurn === 'enemy' ? 'animate-attack-slash' : ''}
                ${isAttacking && currentTurn === 'player' ? 'animate-hit-flash' : ''}
              `}>
                {enemy.name[0].toUpperCase()}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">HP:</span>
                  <span className="ml-auto font-bold">{enemyHealth}/{enemy.stats.maxHealth}</span>
                </div>
                <Progress value={(enemyHealth / enemy.stats.maxHealth) * 100} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3" />
                  <span>ATK: {enemy.stats.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>DEF: {enemy.stats.defense}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>SPD: {enemy.stats.speed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>EVA: {enemy.stats.evasion}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sword className="w-3 h-3 text-destructive" />
                  <span>CRIT: {enemy.stats.critChance}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span>LUCK: {enemy.stats.luck}</span>
                </div>
              </div>
            </div>
          </div>

          {!combatStarted && (
            <Button
              onClick={startCombat}
              className="w-full h-12 text-lg font-bold bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              Start Combat
            </Button>
          )}

          {combatStarted && currentTurn && (
            <div className="text-center py-2 bg-secondary rounded-lg">
              <p className="text-lg font-semibold">
                {currentTurn === 'player' ? player.name : enemy.name}'s Turn
              </p>
            </div>
          )}
        </Card>

        {/* Combat Log */}
        <Card className="p-4 bg-card/90 backdrop-blur-sm border border-primary/20 max-h-48 overflow-y-auto">
          <h3 className="text-lg font-bold mb-2 text-primary">Combat Log</h3>
          <div className="space-y-1">
            {combatLogs.map((log) => (
              <p
                key={log.id}
                className={`text-sm ${
                  log.type === 'victory'
                    ? 'text-green-400 font-bold'
                    : log.type === 'defeat'
                    ? 'text-red-400 font-bold'
                    : log.type === 'attack'
                    ? 'text-primary'
                    : 'text-destructive'
                }`}
              >
                {log.message}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
