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
  const [showInventory, setShowInventory] = useState(false);

  const handleCreateCharacter = (name: string, characterClass: Character['class']) => {
    const newCharacter = createCharacter(name, characterClass);
    setPlayer(newCharacter);
    setGameState('hub');
  };

  const handleCombatEnd = (victory: boolean, expGained: number) => {
    if (!player) return;

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
    const currentItem = equippedItems[item.type];
    
    // Unequip current item if exists
    if (currentItem) {
      setInventory(prev => [...prev, currentItem]);
    }
    
    // Equip new item
    setEquippedItems(prev => ({
      ...prev,
      [item.type]: item,
    }));
    
    // Remove from inventory
    setInventory(prev => prev.filter(i => i.id !== item.id));
    
    // Apply stats to player
    if (player) {
      const allEquipment = Object.values({ ...equippedItems, [item.type]: item }).filter(Boolean) as Equipment[];
      const equipStats = calculateEquipmentStats(allEquipment);
      
      const updatedPlayer = { ...player };
      Object.entries(equipStats).forEach(([key, value]) => {
        if (key in updatedPlayer.stats) {
          (updatedPlayer.stats as any)[key] += value;
        }
      });
      
      setPlayer(updatedPlayer);
    }
    
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

    return (
      <div className="min-h-screen bg-gradient-arena flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2 animate-float">
              Warrior's Hall
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-lg">Welcome, {player.name}</span>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-secondary/50">
              <h2 className="text-2xl font-bold text-center mb-4 capitalize">
                Level {player.level} {player.class}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Experience</span>
                    <span className="font-bold">{player.experience} / {expNeeded}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-gold transition-all duration-500"
                      style={{ width: `${expProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Health</p>
                    <p className="text-xl font-bold">{player.stats.health}/{player.stats.maxHealth}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Attack</p>
                    <p className="text-xl font-bold">{player.stats.attack}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Defense</p>
                    <p className="text-xl font-bold">{player.stats.defense}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Speed</p>
                    <p className="text-xl font-bold">{player.stats.speed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Evasion</p>
                    <p className="text-xl font-bold">{player.stats.evasion}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Crit Chance</p>
                    <p className="text-xl font-bold">{player.stats.critChance}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Luck</p>
                    <p className="text-xl font-bold">{player.stats.luck}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button
              onClick={startNewBattle}
              className="w-full h-14 text-lg font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Swords className="w-5 h-5 mr-2" />
              Enter the Arena
            </Button>
            
            <Button
              onClick={() => setShowInventory(true)}
              variant="outline"
              className="w-full h-12 text-lg font-bold"
            >
              <Backpack className="w-5 h-5 mr-2" />
              Inventory ({inventory.length + Object.values(equippedItems).filter(Boolean).length})
            </Button>
          </div>
          
          {showInventory && (
            <Inventory
              inventory={inventory}
              equippedItems={equippedItems}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
              onClose={() => setShowInventory(false)}
            />
          )}
        </Card>
      </div>
    );
  }

  return null;
};

export default Index;
