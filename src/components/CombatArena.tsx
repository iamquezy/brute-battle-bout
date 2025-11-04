import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Character, CombatLog } from '@/types/game';
import { calculateDamage, createEnemyCharacter, determineFirstAttacker, DifficultyTier } from '@/lib/gameLogic';
import { Sword, Heart, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { CombatEventDisplay } from '@/components/CombatEventDisplay';
import { ComboDisplay } from '@/components/ComboDisplay';
import { CombatActionButtons, CombatAction } from '@/components/combat/CombatActionButtons';
import { TimingBar } from '@/components/combat/TimingBar';
import { SkillSelectionModal } from '@/components/combat/SkillSelectionModal';
import { useCombatSkills, getClassSkills } from '@/hooks/useCombatSkills';
import { 
  playSwordSlash, 
  playBowShot, 
  playSpellCast, 
  playHitSound, 
  playCriticalHit,
  playVictory,
  playDefeat 
} from '@/lib/soundEffects';

// Arena backgrounds
import arenaStone from '@/assets/arenas/arena-stone.jpg';
import arenaForest from '@/assets/arenas/arena-forest.jpg';
import arenaDesert from '@/assets/arenas/arena-desert.jpg';
import arenaIce from '@/assets/arenas/arena-ice.jpg';
import arenaVolcano from '@/assets/arenas/arena-volcano.jpg';

const ARENAS = [
  { name: 'Stone Colosseum', image: arenaStone },
  { name: 'Mystic Forest', image: arenaForest },
  { name: 'Desert Ruins', image: arenaDesert },
  { name: 'Frozen Wasteland', image: arenaIce },
  { name: 'Volcanic Rift', image: arenaVolcano },
];

interface CombatArenaProps {
  player: Character;
  opponentId?: string;
  difficulty?: DifficultyTier;
  onCombatEnd: (victory: boolean, expGained: number, goldGained: number, opponentName?: string) => void;
}

export function CombatArena({ player, opponentId, difficulty = 'normal', onCombatEnd }: CombatArenaProps) {
  const [arena] = useState(() => ARENAS[Math.floor(Math.random() * ARENAS.length)]);
  const [enemy, setEnemy] = useState<Character>(() => createEnemyCharacter(player.level, opponentId, difficulty));
  const [playerHealth, setPlayerHealth] = useState(player.stats.health);
  const [enemyHealth, setEnemyHealth] = useState(enemy.stats.health);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy' | null>(null);
  const [combatStarted, setCombatStarted] = useState(false);
  const [combatEnded, setCombatEnded] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);
  
  // New interactive combat states
  const [waitingForPlayerAction, setWaitingForPlayerAction] = useState(false);
  const [showTimingBar, setShowTimingBar] = useState(false);
  const [showSkillSelection, setShowSkillSelection] = useState(false);
  const [isDefending, setIsDefending] = useState(false);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  
  const { useSkill, tickCooldowns } = useCombatSkills();
  const playerSkills = getClassSkills(player.class);

  const addLog = (message: string, type: CombatLog['type'], icon?: string) => {
    const log: CombatLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now(),
      icon,
    };
    setCombatLogs((prev) => [log, ...prev].slice(0, 20));
  };

  const executeAttack = async (attacker: Character, defender: Character, isPlayer: boolean, damageBonus: number = 1) => {
    setIsAttacking(true);
    
    // Play attack sound based on class
    if (attacker.class === 'fighter') {
      playSwordSlash();
    } else if (attacker.class === 'mage') {
      playSpellCast();
    } else if (attacker.class === 'archer') {
      playBowShot();
    }
    
    const result = calculateDamage(attacker, defender, isPlayer ? comboCount : 0);
    let finalDamage = result.damage;
    
    // Apply damage bonus from timing
    if (damageBonus > 1) {
      finalDamage = Math.floor(finalDamage * damageBonus);
    }
    
    // Apply defend reduction (if defender is defending)
    if (!isPlayer && isDefending) {
      finalDamage = Math.floor(finalDamage * 0.5);
      addLog(`🛡️ ${defender.name} blocks 50% of the damage!`, 'evade', '🛡️');
      setIsDefending(false); // Defend only lasts one turn
    }
    
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Handle random events
    if (result.randomEvent) {
      setCurrentEvent(result.randomEvent);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setCurrentEvent(null);
      
      // Handle arena hazard (damages both)
      if (result.randomEvent === 'arena_hazard' && result.eventDamage) {
        setPlayerHealth((prev) => Math.max(0, prev - result.eventDamage!));
        setEnemyHealth((prev) => Math.max(0, prev - result.eventDamage!));
        addLog(`⚡ Arena hazard deals ${result.eventDamage} damage to both fighters!`, 'event', '⚡');
      }
      
      // Handle second wind
      if (result.randomEvent === 'second_wind') {
        const healAmount = Math.floor(defender.stats.maxHealth * 0.1);
        if (isPlayer) {
          setEnemyHealth((prev) => Math.min(defender.stats.maxHealth, prev + healAmount));
          addLog(`💚 ${defender.name} gained a second wind! Healed ${healAmount} HP!`, 'heal', '💚');
        } else {
          setPlayerHealth((prev) => Math.min(defender.stats.maxHealth, prev + healAmount));
          addLog(`💚 ${defender.name} gained a second wind! Healed ${healAmount} HP!`, 'heal', '💚');
        }
      }
    }
    
    if (result.isEvaded) {
      addLog(`💨 ${defender.name} evaded the attack!`, 'evade', '💨');
      if (isPlayer) {
        setComboCount(0); // Break combo
        toast.info('Attack evaded! Combo broken!');
      }
    } else {
      // Play hit sound and trigger screen shake
      if (result.isCrit) {
        playCriticalHit();
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
      } else {
        playHitSound();
      }
      
      const attackType = attacker.class === 'fighter' ? 'slashes' : 
                         attacker.class === 'mage' ? 'blasts' : 
                         'shoots';
      const critText = result.isCrit ? ' ✨ CRITICAL HIT!' : '';
      const comboText = result.comboMultiplier > 1 ? ` (${result.comboMultiplier.toFixed(1)}x combo)` : '';
      const bonusText = damageBonus > 1 ? ` [${damageBonus}x timing!]` : '';
      
      if (isPlayer) {
        setEnemyHealth((prev) => Math.max(0, prev - finalDamage));
        setComboCount(prev => prev + 1);
        setTotalDamageDealt(prev => prev + finalDamage);
        addLog(`⚔️ ${attacker.name} ${attackType} for ${finalDamage} damage!${critText}${comboText}${bonusText}`, 'attack', '⚔️');
        if (result.isCrit) toast.success('Critical Hit!');
        if (result.comboMultiplier >= 2) toast.success(`${comboCount + 1}x Combo!`);
        if (damageBonus > 1.2) toast.success(`Perfect Timing! ${damageBonus}x Damage!`);
      } else {
        setPlayerHealth((prev) => Math.max(0, prev - finalDamage));
        addLog(`🩸 ${attacker.name} ${attackType} for ${finalDamage} damage!${critText}`, 'damage', '🩸');
        if (result.isCrit) toast.error('Enemy Critical Hit!');
      }
    }
    
    setIsAttacking(false);
  };

  const handlePlayerAction = (action: CombatAction) => {
    setWaitingForPlayerAction(false);

    switch (action) {
      case 'attack':
        setShowTimingBar(true);
        break;
      case 'defend':
        setIsDefending(true);
        addLog(`🛡️ ${player.name} takes a defensive stance!`, 'evade', '🛡️');
        toast.info('Defending! Next attack will deal 50% less damage');
        setCurrentTurn('enemy');
        break;
      case 'skill':
        setShowSkillSelection(true);
        break;
      case 'item':
        toast.info('Items coming soon!');
        setWaitingForPlayerAction(true); // Stay on player turn
        break;
    }
  };

  const handleTimingComplete = async (success: boolean, quality: 'perfect' | 'good' | 'normal') => {
    setShowTimingBar(false);
    
    const damageMultiplier = quality === 'perfect' ? 1.5 : quality === 'good' ? 1.25 : 1;
    
    await executeAttack(player, enemy, true, damageMultiplier);
    
    // Tick down skill cooldowns
    setSkillCooldowns(tickCooldowns(skillCooldowns));
    
    setCurrentTurn('enemy');
  };

  const handleSkillSelect = async (skill: any) => {
    setShowSkillSelection(false);
    
    const { result, newCooldowns } = useSkill(skill, player, enemy, skillCooldowns);
    
    if (!result) {
      setWaitingForPlayerAction(true);
      return;
    }
    
    setSkillCooldowns(newCooldowns);
    setIsAttacking(true);
    
    // Play skill sound
    playSpellCast();
    
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Apply damage
    setEnemyHealth((prev) => Math.max(0, prev - result.damage));
    setTotalDamageDealt(prev => prev + result.damage);
    addLog(`✨ ${result.message}`, 'attack', '✨');
    addLog(`💥 Dealt ${result.damage} damage!`, 'damage', '💥');
    
    if (result.healing) {
      setPlayerHealth((prev) => Math.min(player.stats.maxHealth, prev + result.healing));
      addLog(`💚 Healed ${result.healing} HP!`, 'heal', '💚');
    }
    
    playHitSound();
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
    
    setIsAttacking(false);
    
    // Tick down other skill cooldowns
    setSkillCooldowns(tickCooldowns(newCooldowns));
    
    setCurrentTurn('enemy');
  };

  const startCombat = () => {
    setCombatStarted(true);
    const firstAttacker = determineFirstAttacker(player, enemy);
    setCurrentTurn(firstAttacker);
    addLog('Combat begins!', 'attack');
    toast.success('The battle has begun!');
  };

  const skipCombat = () => {
    // Simulate instant combat resolution
    setCombatEnded(true);
    
    // Simple win probability based on stats
    const playerPower = player.stats.attack + player.stats.defense + player.stats.speed;
    const enemyPower = enemy.stats.attack + enemy.stats.defense + enemy.stats.speed;
    const winChance = playerPower / (playerPower + enemyPower);
    
    const playerWins = Math.random() < winChance;
    
    if (playerWins) {
      const baseExp = enemy.level * 50 + 25;
      const baseGold = Math.floor(10 + Math.random() * 20 + player.level * 5);
      addLog(`✅ Victory! Gained ${baseExp} experience!`, 'victory', '✅');
      playVictory();
      toast.success(`Victory! +${baseExp} EXP`);
      setTimeout(() => onCombatEnd(true, baseExp, baseGold, enemy.name), 1000);
    } else {
      addLog('☠️ You have been defeated...', 'defeat', '☠️');
      playDefeat();
      toast.error('Defeat!');
      setTimeout(() => onCombatEnd(false, 0, 0, enemy.name), 1000);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!waitingForPlayerAction) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        handlePlayerAction('attack');
      } else if (e.key === 'd' || e.key === 'D') {
        handlePlayerAction('defend');
      } else if (e.key === 's' || e.key === 'S') {
        handlePlayerAction('skill');
      } else if (e.key === 'i' || e.key === 'I') {
        handlePlayerAction('item');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [waitingForPlayerAction]);

  useEffect(() => {
    if (!combatStarted || !currentTurn || isAttacking || combatEnded) return;
    if (showTimingBar || showSkillSelection) return;

    if (currentTurn === 'player') {
      // Wait for player input
      setWaitingForPlayerAction(true);
    } else {
      // Enemy turn - auto execute
      const timer = setTimeout(async () => {
        await executeAttack(enemy, player, false);
        setCurrentTurn('player');
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, combatStarted, isAttacking, showTimingBar, showSkillSelection]);

  useEffect(() => {
    if (combatEnded) return;
    
    if (playerHealth <= 0) {
      setCombatEnded(true);
      addLog('☠️ You have been defeated...', 'defeat', '☠️');
      playDefeat();
      toast.error('Defeat!');
      setTimeout(() => onCombatEnd(false, 0, 0, enemy.name), 1500);
    } else if (enemyHealth <= 0) {
      setCombatEnded(true);
      const baseExp = enemy.level * 50 + 25;
      const baseGold = Math.floor(10 + Math.random() * 20 + player.level * 5);
      addLog(`✅ Victory! Gained ${baseExp} experience!`, 'victory', '✅');
      playVictory();
      toast.success(`Victory! +${baseExp} EXP, +${baseGold} Gold`);
      setTimeout(() => onCombatEnd(true, baseExp, baseGold, enemy.name), 1500);
    }
  }, [playerHealth, enemyHealth, combatEnded]);

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
    <div 
      className="min-h-screen p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${arena.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      {/* Arena name badge */}
      <div className="relative z-10 text-center mb-4">
        <div className="inline-block px-6 py-2 bg-card/90 backdrop-blur-sm border-2 border-primary/30 rounded-full">
          <p className="text-sm font-bold text-primary">{arena.name}</p>
        </div>
      </div>
      
      <div className={`max-w-6xl mx-auto space-y-6 relative z-10 ${screenShake ? 'animate-screen-shake' : ''}`}>
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
              
              <div className="relative">
                <div className={`
                  w-32 h-32 mx-auto rounded-full ${getClassGradient(player.class)} 
                  flex items-center justify-center text-6xl font-bold text-white
                  shadow-2xl border-4 border-white/20 transition-all duration-300
                  ${isAttacking && currentTurn === 'player' ? 'animate-attack-slash scale-110' : ''}
                  ${isAttacking && currentTurn === 'enemy' ? 'animate-hit-flash' : ''}
                  ${combatStarted ? 'animate-float' : ''}
                `}>
                  {player.name[0].toUpperCase()}
                </div>
                {isAttacking && currentTurn === 'player' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="text-6xl animate-attack-effect">
                      {player.class === 'fighter' && '⚔️'}
                      {player.class === 'mage' && '✨'}
                      {player.class === 'archer' && '🏹'}
                    </div>
                  </div>
                )}
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
              
              <div className="relative">
                <div className={`
                  w-32 h-32 mx-auto rounded-full ${getClassGradient(enemy.class)} 
                  flex items-center justify-center text-6xl font-bold text-white
                  shadow-2xl border-4 border-white/20 transition-all duration-300
                  ${isAttacking && currentTurn === 'enemy' ? 'animate-attack-slash scale-110' : ''}
                  ${isAttacking && currentTurn === 'player' ? 'animate-hit-flash' : ''}
                  ${combatStarted ? 'animate-float' : ''}
                `}>
                  {enemy.name[0].toUpperCase()}
                </div>
                {isAttacking && currentTurn === 'enemy' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="text-6xl animate-attack-effect">
                      {enemy.class === 'fighter' && '⚔️'}
                      {enemy.class === 'mage' && '✨'}
                      {enemy.class === 'archer' && '🏹'}
                    </div>
                  </div>
                )}
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
            <div className="flex gap-4">
              <Button
                onClick={startCombat}
                className="flex-1 h-12 text-lg font-bold bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                Start Combat
              </Button>
              <Button
                onClick={skipCombat}
                variant="outline"
                className="h-12 px-6 text-lg font-bold"
              >
                Skip
              </Button>
            </div>
          )}

          {combatStarted && currentTurn && !combatEnded && !waitingForPlayerAction && (
            <div className="text-center py-2 bg-secondary rounded-lg">
              <p className="text-lg font-semibold">
                {currentTurn === 'player' ? player.name : enemy.name}'s Turn
              </p>
            </div>
          )}
        </Card>

        {/* Player Action Buttons */}
        {waitingForPlayerAction && !showTimingBar && !showSkillSelection && (
          <CombatActionButtons
            player={player}
            onAction={handlePlayerAction}
            disabled={isAttacking}
            isDefending={isDefending}
          />
        )}

        {/* Timing Bar */}
        {showTimingBar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <TimingBar
              onComplete={handleTimingComplete}
              onCancel={() => {
                setShowTimingBar(false);
                setWaitingForPlayerAction(true);
              }}
            />
          </div>
        )}

        {/* Skill Selection */}
        <SkillSelectionModal
          open={showSkillSelection}
          skills={playerSkills}
          cooldowns={skillCooldowns}
          onSelect={handleSkillSelect}
          onClose={() => {
            setShowSkillSelection(false);
            setWaitingForPlayerAction(true);
          }}
        />

        {/* Combat Log */}
        <Card className="p-4 bg-card/90 backdrop-blur-sm border border-primary/20 max-h-96 overflow-y-auto">
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
                    : log.type === 'crit'
                    ? 'text-yellow-400 font-bold'
                    : log.type === 'evade'
                    ? 'text-blue-400'
                    : log.type === 'event'
                    ? 'text-purple-400 font-bold'
                    : log.type === 'heal'
                    ? 'text-green-500'
                    : 'text-destructive'
                }`}
              >
                {log.message}
              </p>
            ))}
          </div>
        </Card>
        
        {/* Combo Display */}
        {comboCount > 0 && combatStarted && !combatEnded && (
          <ComboDisplay combo={comboCount} />
        )}
        
        {/* Combat Event Display */}
        <CombatEventDisplay event={currentEvent} />
      </div>
    </div>
  );
}
