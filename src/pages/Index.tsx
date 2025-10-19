import { useState } from 'react';
import { Character, StatType } from '@/types/game';
import { Equipment, EquipmentSlots } from '@/types/equipment';
import { CharacterCreation } from '@/components/CharacterCreation';
import { OpponentSelection } from '@/components/OpponentSelection';
import { CombatArena } from '@/components/CombatArena';
import { LevelUpModal } from '@/components/LevelUpModal';
import { Inventory } from '@/components/Inventory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createCharacter, levelUpCharacter, checkLevelUp } from '@/lib/gameLogic';
import { generateEquipment, shouldDropLoot, calculateEquipmentStats } from '@/lib/equipmentLogic';
import { Trophy, Swords, Backpack } from 'lucide-react';
import { toast } from 'sonner';

type GameState = 'creation' | 'hub' | 'opponent-selection' | 'combat' | 'levelup';

interface BattleRecord {
  opponent: string;
  result: 'victory' | 'defeat';
  timestamp: number;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('creation');
  const [player, setPlayer] = useState<Character | null>(null);
  const [pendingLevelUp, setPendingLevelUp] = useState(false);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | undefined>(undefined);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquipmentSlots>({
    weapon: null,
    armor: null,
    accessory: null,
  });
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);

  const handleCreateCharacter = (name: string, characterClass: Character['class']) => {
    const newCharacter = createCharacter(name, characterClass);
    setPlayer(newCharacter);
    setGameState('hub');
  };

  const handleCombatEnd = (victory: boolean, expGained: number, opponentName?: string) => {
    if (!player) return;

    // Add to battle history
    const result: 'victory' | 'defeat' = victory ? 'victory' : 'defeat';
    setBattleHistory(prev => [{
      opponent: opponentName || 'Unknown',
      result,
      timestamp: Date.now(),
    }, ...prev].slice(0, 10)); // Keep last 10 battles

    if (victory) {
      const updatedPlayer = { ...player };
      updatedPlayer.experience += expGained;
      updatedPlayer.stats.health = updatedPlayer.stats.maxHealth; // Heal after victory
      
      setPlayer(updatedPlayer);
      
      // Check for equipment drop
      if (shouldDropLoot()) {
        const loot = generateEquipment(
          ['weapon', 'armor', 'accessory'][Math.floor(Math.random() * 3)] as any,
          player.class
        );
        setInventory(prev => [...prev, loot]);
        toast.success(`Found ${loot.name}!`, {
          description: 'Check your inventory to equip it.',
        });
      }
      
      if (checkLevelUp(updatedPlayer)) {
        setPendingLevelUp(true);
        setGameState('levelup');
      } else {
        setGameState('hub');
      }
    } else {
      // On defeat, heal and return to hub
      const updatedPlayer = { ...player };
      updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
      setPlayer(updatedPlayer);
      setGameState('hub');
    }
  };

  const handleLevelUpChoice = (stat: StatType) => {
    if (!player) return;
    
    const leveledUpPlayer = levelUpCharacter(player, stat);
    setPlayer(leveledUpPlayer);
    setPendingLevelUp(false);
    setGameState('hub');
  };

  const startNewBattle = () => {
    setGameState('opponent-selection');
  };

  const handleOpponentSelected = (opponentId: string) => {
    setSelectedOpponentId(opponentId);
    setGameState('combat');
  };

  const handleCancelOpponentSelection = () => {
    setGameState('hub');
  };

  const handleEquip = (item: Equipment) => {
    if (!player) return;
    
    const currentItem = equippedItems[item.type];
    
    // Unequip current item if exists
    if (currentItem) {
      setInventory(prev => [...prev, currentItem]);
    }
    
    // Equip new item
    const newEquippedItems = {
      ...equippedItems,
      [item.type]: item,
    };
    
    setEquippedItems(newEquippedItems);
    
    // Remove from inventory
    setInventory(prev => prev.filter(i => i.id !== item.id));
    
    // Recalculate stats from base
    const basePlayer = createCharacter(player.name, player.class);
    const updatedPlayer = { ...basePlayer };
    updatedPlayer.level = player.level;
    updatedPlayer.experience = player.experience;
    
    // Apply all equipment stats
    const allEquipment = Object.values(newEquippedItems).filter(Boolean) as Equipment[];
    const equipStats = calculateEquipmentStats(allEquipment);
    
    Object.entries(equipStats).forEach(([key, value]) => {
      if (key in updatedPlayer.stats) {
        (updatedPlayer.stats as any)[key] += value;
      }
    });
    
    setPlayer(updatedPlayer);
    
    toast.success(`Equipped ${item.name}`);
  };

  const handleUnequip = (slot: keyof EquipmentSlots) => {
    const item = equippedItems[slot];
    if (!item || !player) return;
    
    // Add to inventory
    setInventory(prev => [...prev, item]);
    
    // Remove stats from player
    const allEquipment = Object.values({ ...equippedItems, [slot]: null }).filter(Boolean) as Equipment[];
    const equipStats = calculateEquipmentStats(allEquipment);
    
    // Recalculate base stats
    const basePlayer = createCharacter(player.name, player.class);
    const updatedPlayer = { ...basePlayer };
    updatedPlayer.level = player.level;
    updatedPlayer.experience = player.experience;
    
    // Reapply equipment stats
    Object.entries(equipStats).forEach(([key, value]) => {
      if (key in updatedPlayer.stats) {
        (updatedPlayer.stats as any)[key] += value;
      }
    });
    
    setPlayer(updatedPlayer);
    
    // Unequip
    setEquippedItems(prev => ({
      ...prev,
      [slot]: null,
    }));
    
    toast.info(`Unequipped ${item.name}`);
  };

  if (gameState === 'creation') {
    return <CharacterCreation onCreateCharacter={handleCreateCharacter} />;
  }

  if (gameState === 'opponent-selection' && player) {
    return (
      <OpponentSelection
        playerLevel={player.level}
        onSelectOpponent={handleOpponentSelected}
        onCancel={handleCancelOpponentSelection}
      />
    );
  }

  if (gameState === 'combat' && player) {
    return <CombatArena player={player} opponentId={selectedOpponentId} onCombatEnd={handleCombatEnd} />;
  }

  if (gameState === 'levelup' && player) {
    return (
      <LevelUpModal
        open={pendingLevelUp}
        level={player.level}
        onChooseStat={handleLevelUpChoice}
      />
    );
  }

  // Hub
  if (gameState === 'hub' && player) {
    const expNeeded = player.level * 100;
    const expProgress = (player.experience / expNeeded) * 100;
    const wins = battleHistory.filter(b => b.result === 'victory').length;
    const losses = battleHistory.filter(b => b.result === 'defeat').length;

    return (
      <div className="min-h-screen bg-gradient-arena p-4">
        {/* Header with Arena Button */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="text-center mb-4">
            <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2 animate-float">
              Warrior's Hall
            </h1>
          </div>
          <Button
            onClick={startNewBattle}
            className="w-full max-w-md mx-auto block h-16 text-xl font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity shadow-combat"
          >
            <Swords className="w-6 h-6 mr-2" />
            Enter the Arena
          </Button>
        </div>

        {/* Main Layout: 3 columns */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Equipment */}
          <Card className="p-6 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Backpack className="w-6 h-6 text-primary" />
              Equipment
            </h2>
            
            {/* Equipped Items */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Equipped</h3>
              <div className="space-y-2">
                {(['weapon', 'armor', 'accessory'] as const).map((slot) => {
                  const item = equippedItems[slot];
                  return (
                    <div key={slot} className="p-3 bg-secondary/50 rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground capitalize mb-1">{slot}</div>
                      {item ? (
                        <div>
                          <p className={`text-sm font-bold ${
                            item.rarity === 'legendary' ? 'text-[hsl(var(--rarity-legendary))]' :
                            item.rarity === 'epic' ? 'text-[hsl(var(--rarity-epic))]' :
                            item.rarity === 'rare' ? 'text-[hsl(var(--rarity-rare))]' :
                            item.rarity === 'uncommon' ? 'text-[hsl(var(--rarity-uncommon))]' :
                            'text-[hsl(var(--rarity-common))]'
                          }`}>
                            {item.name}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Empty</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory Items */}
            <div>
              <h3 className="text-lg font-bold mb-3">Inventory ({inventory.length})</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {inventory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    Defeat enemies to find loot!
                  </p>
                ) : (
                  inventory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform ${
                        item.rarity === 'legendary' ? 'border-[hsl(var(--rarity-legendary))]' :
                        item.rarity === 'epic' ? 'border-[hsl(var(--rarity-epic))]' :
                        item.rarity === 'rare' ? 'border-[hsl(var(--rarity-rare))]' :
                        item.rarity === 'uncommon' ? 'border-[hsl(var(--rarity-uncommon))]' :
                        'border-[hsl(var(--rarity-common))]'
                      }`}
                      onClick={() => handleEquip(item)}
                    >
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                    </div>
                  ))
                )}
              </div>
              {inventory.length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open full inventory modal
                    const modal = document.createElement('div');
                    document.body.appendChild(modal);
                  }}
                  className="w-full mt-3"
                >
                  View All ({inventory.length})
                </Button>
              )}
            </div>
          </Card>

          {/* Center: Character Stats */}
          <Card className="p-6 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">{player.name}</h2>
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground font-bold text-lg">
                Level {player.level}
              </div>
              <div className="mt-2 text-sm text-muted-foreground capitalize">
                {player.class} Warrior
              </div>
            </div>

            {/* Experience Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Experience</span>
                <span className="font-bold">{player.experience} / {expNeeded}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden border-2 border-primary/30">
                <div 
                  className="h-full bg-gradient-gold transition-all duration-500"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Health</p>
                <p className="text-lg font-bold">{player.stats.health}/{player.stats.maxHealth}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Attack</p>
                <p className="text-lg font-bold">{player.stats.attack}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Defense</p>
                <p className="text-lg font-bold">{player.stats.defense}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Speed</p>
                <p className="text-lg font-bold">{player.stats.speed}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Evasion</p>
                <p className="text-lg font-bold">{player.stats.evasion}%</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Crit</p>
                <p className="text-lg font-bold">{player.stats.critChance}%</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Luck</p>
                <p className="text-lg font-bold">{player.stats.luck}</p>
              </div>
            </div>
          </Card>

          {/* Right: Battle History */}
          <Card className="p-6 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Battle History
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-green-400">Victories: {wins}</span>
                <span className="text-red-400">Defeats: {losses}</span>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Win Rate: {battleHistory.length > 0 ? Math.round((wins / battleHistory.length) * 100) : 0}%
              </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {battleHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No battles yet</p>
              ) : (
                battleHistory.map((battle, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border-2 ${
                      battle.result === 'victory'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{battle.opponent}</span>
                      <span className={`text-xs font-bold uppercase ${
                        battle.result === 'victory' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {battle.result}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
