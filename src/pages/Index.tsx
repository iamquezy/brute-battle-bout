import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character, StatType } from '@/types/game';
import { useAuth } from '@/hooks/useAuth';
import { createProfile, loadProfile, saveProfile, updateLeaderboard } from '@/lib/profileSync';
import { Equipment, EquipmentSlots } from '@/types/equipment';
import { ShopItem, ActiveBuff } from '@/types/shop';
import { Quest } from '@/types/quests';
import { Achievement, AchievementStats, Title } from '@/types/achievements';
import { Pet } from '@/types/pets';
import { CraftingMaterials, DISMANTLE_REWARDS, UPGRADE_COSTS } from '@/types/crafting';
import { SkillTreeNode } from '@/types/skillTree';
import { DifficultyTier, DIFFICULTY_TIERS } from '@/lib/gameLogic';
import { DifficultySelector } from '@/components/DifficultySelector';
import { CharacterCreation } from '@/components/CharacterCreation';
import { OpponentSelection } from '@/components/OpponentSelection';
import { CombatArena } from '@/components/CombatArena';
import { PvPHub } from '@/components/PvPHub';
import { PvPCombat } from '@/components/PvPCombat';
import { LevelUpModal } from '@/components/LevelUpModal';
import { BossSelection } from '@/components/BossSelection';
import { BossBattle } from '@/components/BossBattle';
import { GuildHub } from '@/components/GuildHub';
import { Cosmetics } from '@/components/Cosmetics';
import { HallOfFame } from '@/components/HallOfFame';
import { PrestigeModal } from '@/components/PrestigeModal';
import { Inventory } from '@/components/Inventory';
import { Skills } from '@/components/Skills';
import { Shop } from '@/components/Shop';
import { Quests } from '@/components/Quests';
import { Achievements } from '@/components/Achievements';
import { Pets } from '@/components/Pets';
import { Crafting } from '@/components/Crafting';
import { TrainingGround } from '@/components/TrainingGround';
import { SkillTree } from '@/components/SkillTree';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { createCharacter, levelUpCharacter, checkLevelUp } from '@/lib/gameLogic';
import { generateEquipment, shouldDropLoot, calculateEquipmentStats } from '@/lib/equipmentLogic';
import { getRandomSkill, getSkillById } from '@/lib/skillsData';
import { createDailyQuests, createWeeklyQuests, ACHIEVEMENT_QUESTS } from '@/lib/questData';
import { ACHIEVEMENTS, TITLES } from '@/lib/achievementData';
import { rollPetDrop, PET_LIBRARY } from '@/lib/petData';
import { getSkillTreeForClass } from '@/lib/skillTreeData';
import { saveGame, loadGame, clearGame } from '@/lib/saveGame';
import { Trophy, Swords, Backpack, Store, Coins, Target, Award, Sparkles, Hammer, Zap, RotateCcw, LogOut, Skull, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';

type GameState = 'creation' | 'hub' | 'opponent-selection' | 'difficulty-selection' | 'combat' | 'levelup' | 'pvp-hub' | 'pvp-combat' | 'boss-selection' | 'boss-battle' | 'guild-hub' | 'cosmetics' | 'hall-of-fame' | 'training';

interface BattleRecord {
  opponent: string;
  result: 'victory' | 'defeat';
  timestamp: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [gameState, setGameState] = useState<GameState>('creation');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [player, setPlayer] = useState<Character | null>(null);
  const [pendingLevelUp, setPendingLevelUp] = useState(false);
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | undefined>(undefined);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyTier>('normal');
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquipmentSlots>({
    weapon: null,
    armor: null,
    accessory: null,
  });
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);
  const [acquiredSkills, setAcquiredSkills] = useState<string[]>([]);
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);
  const [shopOpen, setShopOpen] = useState(false);
  
  // Phase 2: Quest System
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [achievementQuests, setAchievementQuests] = useState<Quest[]>([]);
  const [questsOpen, setQuestsOpen] = useState(false);
  
  // Phase 2: Achievement System
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementStats, setAchievementStats] = useState<AchievementStats>({
    totalWins: 0, totalLosses: 0, totalDamageDealt: 0, criticalHits: 0,
    attacksEvaded: 0, itemsFound: 0, legendaryItemsOwned: 0, skillsAcquired: 0,
    goldEarned: 0, lowHealthWins: 0
  });
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  
  // Phase 2: Pet System
  const [collectedPets, setCollectedPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petsOpen, setPetsOpen] = useState(false);
  
  // Phase 2: Crafting System
  const [craftingMaterials, setCraftingMaterials] = useState<CraftingMaterials>({
    common_shard: 0, uncommon_shard: 0, rare_shard: 0, epic_shard: 0, legendary_shard: 0
  });
  const [craftingOpen, setCraftingOpen] = useState(false);
  
  // Phase 2: Skill Tree
  const [skillTreeNodes, setSkillTreeNodes] = useState<SkillTreeNode[]>([]);
  const [skillPoints, setSkillPoints] = useState(0);
  const [skillTreeOpen, setSkillTreeOpen] = useState(false);

  // Phase 2.5: Save System
  const [lastDailyReset, setLastDailyReset] = useState(Date.now());
  const [lastWeeklyReset, setLastWeeklyReset] = useState(Date.now());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Phase 3: PvP System
  const [playerRating, setPlayerRating] = useState(1000);
  const [pvpOpponentId, setPvpOpponentId] = useState<string>('');
  const [pvpOpponentName, setPvpOpponentName] = useState<string>('');
  const [pvpWinStreak, setPvpWinStreak] = useState(0);

  // Phase 4: Content Expansion
  const [selectedBossId, setSelectedBossId] = useState<string>('');
  const [prestigeModalOpen, setPrestigeModalOpen] = useState(false);

  // Auth check and redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Load profile from cloud
  useEffect(() => {
    if (!user || profileLoaded) return;

    const initializeProfile = async () => {
      const profile = await loadProfile(user.id);
      
      if (!profile) {
        // Create new profile with localStorage data if exists
        const username = user.user_metadata?.username || 'Warrior';
        await createProfile(user.id, username);
        setProfileLoaded(true);
        
        // Load from localStorage if it exists
        const savedGame = loadGame();
        if (savedGame) {
          setPlayer(savedGame.player);
          setInventory(savedGame.inventory);
          setEquippedItems(savedGame.equippedItems);
          setBattleHistory(savedGame.battleHistory);
          setAcquiredSkills(savedGame.acquiredSkills);
          setActiveBuffs(savedGame.activeBuffs);
          setDailyQuests(savedGame.dailyQuests);
          setWeeklyQuests(savedGame.weeklyQuests);
          setAchievements(savedGame.achievements);
          setCurrentTitle(savedGame.equippedTitle);
          setCollectedPets(savedGame.collectedPets);
          setActivePet(savedGame.activePet);
          setCraftingMaterials(savedGame.craftingMaterials);
          setSkillTreeNodes(savedGame.skillTreeNodes);
          setSkillPoints(savedGame.skillPoints);
          setAchievementStats(savedGame.achievementStats);
          setLastDailyReset(savedGame.lastDailyReset);
          setLastWeeklyReset(savedGame.lastWeeklyReset);

          // Check for quest resets
          const now = Date.now();
          const dayInMs = 24 * 60 * 60 * 1000;
          const weekInMs = 7 * dayInMs;

          if (now - savedGame.lastDailyReset > dayInMs) {
            setDailyQuests(createDailyQuests());
            setLastDailyReset(now);
          }

          if (now - savedGame.lastWeeklyReset > weekInMs) {
            setWeeklyQuests(createWeeklyQuests());
            setLastWeeklyReset(now);
          }

          if (savedGame.player) {
            setGameState('hub');
          }
        }
      } else {
        // Load from cloud profile
        const data = profile.character_data;

        if (data.character) {
          // Only apply cloud data if a character exists
          setPlayer(data.character);
          setInventory(data.inventory);
          setEquippedItems(data.equippedItems);
          setBattleHistory(data.battleHistory);
          setAcquiredSkills(data.acquiredSkills);
          setActiveBuffs(data.activeBuffs);
          setDailyQuests(data.dailyQuests);
          setWeeklyQuests(data.weeklyQuests);
          setAchievements(data.achievements);
          setCurrentTitle(data.equippedTitle);
          setCollectedPets(data.collectedPets);
          setActivePet(data.activePet);
          setCraftingMaterials(data.craftingMaterials);
          setSkillTreeNodes(data.skillTreeNodes);
          setSkillPoints(data.skillPoints);
          setAchievementStats(data.achievementStats);
          setLastDailyReset(data.lastDailyReset);
          setLastWeeklyReset(data.lastWeeklyReset);

          // Check for quest resets
          const now = Date.now();
          const dayInMs = 24 * 60 * 60 * 1000;
          const weekInMs = 7 * dayInMs;

          if (now - data.lastDailyReset > dayInMs) {
            setDailyQuests(createDailyQuests());
            setLastDailyReset(now);
          }

          if (now - data.lastWeeklyReset > weekInMs) {
            setWeeklyQuests(createWeeklyQuests());
            setLastWeeklyReset(now);
          }

          setGameState('hub');
        } else {
          // No cloud character yet — try to recover from local save without overwriting
          const savedGame = loadGame();
          if (savedGame?.player) {
            setPlayer(savedGame.player);
            setInventory(savedGame.inventory);
            setEquippedItems(savedGame.equippedItems);
            setBattleHistory(savedGame.battleHistory);
            setAcquiredSkills(savedGame.acquiredSkills);
            setActiveBuffs(savedGame.activeBuffs);
            setDailyQuests(savedGame.dailyQuests);
            setWeeklyQuests(savedGame.weeklyQuests);
            setAchievements(savedGame.achievements);
            setCurrentTitle(savedGame.equippedTitle);
            setCollectedPets(savedGame.collectedPets);
            setActivePet(savedGame.activePet);
            setCraftingMaterials(savedGame.craftingMaterials);
            setSkillTreeNodes(savedGame.skillTreeNodes);
            setSkillPoints(savedGame.skillPoints);
            setAchievementStats(savedGame.achievementStats);
            setLastDailyReset(savedGame.lastDailyReset);
            setLastWeeklyReset(savedGame.lastWeeklyReset);
            setGameState('hub');

            // Persist recovered local state to cloud (best-effort)
            saveProfile(user.id, {
              character: savedGame.player,
              inventory: savedGame.inventory,
              equippedItems: savedGame.equippedItems,
              battleHistory: savedGame.battleHistory,
              acquiredSkills: savedGame.acquiredSkills,
              activeBuffs: savedGame.activeBuffs,
              dailyQuests: savedGame.dailyQuests,
              weeklyQuests: savedGame.weeklyQuests,
              achievements: savedGame.achievements,
              equippedTitle: savedGame.equippedTitle,
              collectedPets: savedGame.collectedPets,
              activePet: savedGame.activePet,
              craftingMaterials: savedGame.craftingMaterials,
              skillTreeNodes: savedGame.skillTreeNodes,
              skillPoints: savedGame.skillPoints,
              achievementStats: savedGame.achievementStats,
              lastDailyReset: savedGame.lastDailyReset,
              lastWeeklyReset: savedGame.lastWeeklyReset,
            });
          } else {
            // Nothing to load — remain in creation flow
            setGameState('creation');
          }
        }
      }

      setProfileLoaded(true);
      setIsLoaded(true);
    };

    initializeProfile();
  }, [user, profileLoaded]);

  // Removed duplicate localStorage loading - handled by cloud profile loading

  // Auto-save with debounce
  useEffect(() => {
    if (!isLoaded || !player) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const success = saveGame({
        player,
        inventory,
        equippedItems,
        battleHistory,
        acquiredSkills,
        activeBuffs,
        shopItems: [],
        dailyQuests,
        weeklyQuests,
        achievements,
        equippedTitle: currentTitle,
        collectedPets,
        activePet,
        craftingMaterials,
        skillTreeNodes,
        skillPoints,
        achievementStats,
        lastDailyReset,
        lastWeeklyReset,
      });

      if (!success) {
        toast.error('Failed to save progress');
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    isLoaded,
    player,
    inventory,
    equippedItems,
    battleHistory,
    acquiredSkills,
    activeBuffs,
    dailyQuests,
    weeklyQuests,
    achievements,
    currentTitle,
    collectedPets,
    activePet,
    craftingMaterials,
    skillTreeNodes,
    skillPoints,
    lastDailyReset,
    lastWeeklyReset,
  ]);

  const handleResetProgress = () => {
    clearGame();
    window.location.reload();
  };

  const handleCreateCharacter = (name: string, characterClass: Character['class']) => {
    const newCharacter = createCharacter(name, characterClass);
    setPlayer(newCharacter);
    
    // Initialize Phase 2 systems
    setDailyQuests(createDailyQuests());
    setWeeklyQuests(createWeeklyQuests());
    setAchievementQuests([...ACHIEVEMENT_QUESTS]);
    setAchievements([...ACHIEVEMENTS]);
    setSkillTreeNodes(getSkillTreeForClass(characterClass).nodes);
    
    setGameState('hub');
  };

  const handleCombatEnd = (victory: boolean, expGained: number, goldGained: number, opponentName?: string) => {
    if (!player) return;

    const result: 'victory' | 'defeat' = victory ? 'victory' : 'defeat';
    setBattleHistory(prev => [{
      opponent: opponentName || 'Unknown',
      result,
      timestamp: Date.now(),
    }, ...prev].slice(0, 10));

    // Update achievement stats
    setAchievementStats(prev => ({
      ...prev,
      totalWins: victory ? prev.totalWins + 1 : prev.totalWins,
      totalLosses: !victory ? prev.totalLosses + 1 : prev.totalLosses,
    }));

    if (victory) {
      const updatedPlayer = { ...player };
      
      // Apply difficulty modifiers from DIFFICULTY_TIERS
      const goldReward = goldGained;
      updatedPlayer.gold += goldReward;
      
      // Apply exp buffs & pet bonuses & difficulty multiplier
      let finalExp = expGained;
      
      // Apply difficulty multiplier
      const diffMod = DIFFICULTY_TIERS[selectedDifficulty];
      finalExp = Math.floor(finalExp * diffMod.expBonus);
      
      activeBuffs.forEach(buff => {
        if (buff.type === 'exp-boost') finalExp = Math.floor(finalExp * buff.multiplier);
      });
      if (activePet?.bonuses.expMultiplier) {
        finalExp = Math.floor(finalExp * activePet.bonuses.expMultiplier);
      }
      
      updatedPlayer.experience += finalExp;
      updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
      
      setActiveBuffs(prev => 
        prev.map(buff => ({ ...buff, battlesRemaining: buff.battlesRemaining - 1 }))
          .filter(buff => buff.battlesRemaining > 0)
      );
      
      // Update pet experience
      if (activePet) {
        setActivePet(prev => {
          if (!prev) return null;
          const newExp = prev.experience + finalExp;
          if (newExp >= 200) {
            toast.success(`${prev.name} leveled up!`);
            return { ...prev, level: prev.level + 1, experience: newExp - 200 };
          }
          return { ...prev, experience: newExp };
        });
      }
      
      setPlayer(updatedPlayer);
      
      // Update quests
      setDailyQuests(prev => prev.map(q => 
        q.objective === 'win_battles' ? { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target } : q
      ));
      setWeeklyQuests(prev => prev.map(q => 
        q.objective === 'win_battles' ? { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target } : q
      ));
      setAchievementQuests(prev => prev.map(q => 
        q.objective === 'win_battles' ? { ...q, progress: q.progress + 1, completed: q.progress + 1 >= q.target } : q
      ));
      
      // Check achievements
      checkAchievements();
      
      toast.success(`Victory! +${goldReward} gold`, {
        description: finalExp > expGained ? `${finalExp} exp (boosted!)` : `${expGained} exp`,
      });
      
      // Equipment drop
      if (shouldDropLoot()) {
        const loot = generateEquipment(
          ['weapon', 'armor', 'accessory'][Math.floor(Math.random() * 3)] as any,
          player.class
        );
        setInventory(prev => [...prev, loot]);
        setAchievementStats(prev => ({ ...prev, itemsFound: prev.itemsFound + 1 }));
        toast.success(`Found ${loot.name}!`);
      }
      
      // Pet drop
      const petDrop = rollPetDrop();
      if (petDrop) {
        setCollectedPets(prev => [...prev, petDrop]);
        toast.success(`${petDrop.emoji} ${petDrop.name} joined you!`, {
          description: `A ${petDrop.rarity} companion!`
        });
      }
      
      if (checkLevelUp(updatedPlayer)) {
        setPendingLevelUp(true);
        setGameState('levelup');
      } else {
        setGameState('hub');
      }
    } else {
      const updatedPlayer = { ...player };
      updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
      setPlayer(updatedPlayer);
      setGameState('hub');
    }
  };

  const handleLevelUpChoice = (stat: StatType) => {
    if (!player) return;
    
    const leveledUpPlayer = levelUpCharacter(player, stat);
    
    // Award skill point instead of random skill
    setSkillPoints(prev => prev + 1);
    toast.success('Level Up!', {
      description: `+1 Skill Point (${skillPoints + 1} total)`
    });
    
    // Update quests
    setWeeklyQuests(prev => prev.map(q => 
      q.objective === 'reach_level' ? { ...q, progress: leveledUpPlayer.level, completed: leveledUpPlayer.level >= q.target } : q
    ));
    setAchievementQuests(prev => prev.map(q => 
      q.objective === 'reach_level' ? { ...q, progress: leveledUpPlayer.level, completed: leveledUpPlayer.level >= q.target } : q
    ));
    
    setPlayer(leveledUpPlayer);
    checkAchievements();
    
    setPendingLevelUp(false);
    setGameState('hub');
  };

  const startNewBattle = () => {
    setGameState('difficulty-selection');
  };
  
  const handleDifficultySelected = (difficulty: DifficultyTier) => {
    setSelectedDifficulty(difficulty);
    setGameState('opponent-selection');
  };
  
  const handleCancelDifficultySelection = () => {
    setGameState('hub');
  };

  const handleOpponentSelected = (opponentId?: string) => {
    setSelectedOpponentId(opponentId);
    setGameState('combat');
  };

  const handleCancelOpponentSelection = () => {
    setGameState('difficulty-selection');
  };

  // Phase 3: PvP Handlers
  const openPvPHub = () => {
    setGameState('pvp-hub');
  };

  const handlePvPChallenge = (opponentId: string, opponentName: string) => {
    setPvpOpponentId(opponentId);
    setPvpOpponentName(opponentName);
    setGameState('pvp-combat');
  };

  // Phase 4: Content Expansion Handlers
  const openBossSelection = () => setGameState('boss-selection');
  const openGuildHub = () => setGameState('guild-hub');
  const openCosmetics = () => setGameState('cosmetics');
  const openHallOfFame = () => setGameState('hall-of-fame');
  
  const handleSelectBoss = (bossId: string) => {
    setSelectedBossId(bossId);
    setGameState('boss-battle');
  };

  const handleBossBattleEnd = (rewards: any) => {
    if (player) {
      setPlayer({
        ...player,
        gold: player.gold + (rewards.gold || 0),
        experience: player.experience + (rewards.experience || 0)
      });
      toast.success('Rewards collected!');
    }
    setGameState('boss-selection');
  };

  const handlePrestigeComplete = () => {
    if (player && user) {
      loadProfile(user.id).then(profile => {
        if (profile?.character_data?.character) {
          setPlayer(profile.character_data.character);
          toast.success('Character reset with prestige bonuses!');
        }
      });
    }
  };

  const handlePvPCombatEnd = async (result: any, rewards: any, newRating: number) => {
    if (!player || !user) return;

    const updatedPlayer = { ...player };
    updatedPlayer.gold += rewards.gold || 0;
    updatedPlayer.experience += rewards.experience || 0;

    if (rewards.materials) {
      setCraftingMaterials(prev => ({
        ...prev,
        [rewards.materials.type]: prev[rewards.materials.type as keyof CraftingMaterials] + rewards.materials.amount
      }));
    }

    setPlayer(updatedPlayer);
    setPlayerRating(newRating);
    
    const won = result.winner === 'attacker';
    setPvpWinStreak(won ? pvpWinStreak + 1 : 0);

    await updateLeaderboard(user.id, user.user_metadata?.username || 'Warrior', {
      level: updatedPlayer.level,
      wins: won ? achievementStats.totalWins + 1 : achievementStats.totalWins,
      losses: won ? achievementStats.totalLosses : achievementStats.totalLosses + 1,
      gold: updatedPlayer.gold,
      rating: newRating
    });

    setGameState('pvp-hub');
  };
  
  // Phase 2: Helper Functions
  const checkAchievements = () => {
    setAchievements(prev => prev.map(ach => {
      let newProgress = ach.progress;
      
      if (ach.id === 'ach_novice_fighter' || ach.id === 'ach_veteran_warrior' || ach.id === 'ach_champion') {
        newProgress = achievementStats.totalWins;
      } else if (ach.id === 'ach_critical_master') {
        newProgress = achievementStats.criticalHits;
      } else if (ach.id === 'ach_untouchable') {
        newProgress = achievementStats.attacksEvaded;
      } else if (ach.id === 'ach_rising_star' || ach.id === 'ach_hero' || ach.id === 'ach_legend') {
        newProgress = player?.level || 0;
      } else if (ach.id === 'ach_treasure_hunter') {
        newProgress = achievementStats.itemsFound;
      } else if (ach.id === 'ach_legendary_collector') {
        newProgress = achievementStats.legendaryItemsOwned;
      } else if (ach.id === 'ach_glass_cannon') {
        newProgress = achievementStats.lowHealthWins;
      } else if (ach.id === 'ach_wealthy') {
        newProgress = achievementStats.goldEarned;
      }
      
      const wasCompleted = ach.completed;
      const isCompleted = newProgress >= ach.requirement;
      
      if (isCompleted && !wasCompleted) {
        toast.success(`Achievement Unlocked: ${ach.name}!`);
        if (ach.unlocksTitle) {
          toast.success(`New title unlocked: ${TITLES[ach.unlocksTitle].name}!`);
        }
      }
      
      return { ...ach, progress: newProgress, completed: isCompleted };
    }));
  };
  
  // Phase 2: Quest Handlers
  const handleClaimQuestReward = (questId: string) => {
    const claimQuest = (quests: Quest[]) => {
      return quests.map(q => {
        if (q.id === questId && q.completed && !q.claimed) {
          if (!player) return q;
          
          const updatedPlayer = { ...player };
          if (q.reward.gold) updatedPlayer.gold += q.reward.gold;
          if (q.reward.exp) updatedPlayer.experience += q.reward.exp;
          if (q.reward.item) {
            const loot = generateEquipment(
              ['weapon', 'armor', 'accessory'][Math.floor(Math.random() * 3)] as any,
              player.class
            );
            setInventory(prev => [...prev, loot]);
          }
          if (q.reward.skillToken) {
            setSkillPoints(prev => prev + 1);
          }
          
          setPlayer(updatedPlayer);
          toast.success(`Quest Complete: ${q.name}!`);
          return { ...q, claimed: true };
        }
        return q;
      });
    };
    
    setDailyQuests(claimQuest);
    setWeeklyQuests(claimQuest);
    setAchievementQuests(claimQuest);
  };
  
  // Phase 2: Achievement Handlers
  const handleEquipTitle = (titleId: string) => {
    setCurrentTitle(titleId);
    toast.success(`Title equipped: ${TITLES[titleId].name}`);
  };
  
  const handleUnequipTitle = () => {
    setCurrentTitle(null);
    toast.info('Title unequipped');
  };
  
  // Phase 2: Pet Handlers
  const handleEquipPet = (petId: string) => {
    const pet = collectedPets.find(p => p.id === petId);
    if (pet) {
      setActivePet(pet);
      toast.success(`${pet.emoji} ${pet.name} is now active!`);
    }
  };
  
  const handleUnequipPet = () => {
    if (activePet) {
      toast.info(`${activePet.name} returned`);
      setActivePet(null);
    }
  };
  
  // Phase 2: Crafting Handlers
  const handleDismantle = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    
    const shardType = `${item.rarity}_shard` as keyof CraftingMaterials;
    const shardAmount = DISMANTLE_REWARDS[item.rarity];
    
    setCraftingMaterials(prev => ({
      ...prev,
      [shardType]: prev[shardType] + shardAmount
    }));
    
    setInventory(prev => prev.filter(i => i.id !== itemId));
    toast.success(`Dismantled ${item.name} for ${shardAmount} ${item.rarity} shards`);
  };
  
  const handleUpgrade = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || !player || item.rarity === 'legendary') return;
    
    const cost = UPGRADE_COSTS[item.rarity];
    if (!cost) return;
    
    const shardType = `${item.rarity}_shard` as keyof CraftingMaterials;
    if (craftingMaterials[shardType] < cost.shards || player.gold < cost.gold) {
      toast.error('Not enough resources!');
      return;
    }
    
    const rarityOrder: Array<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'> = 
      ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const newRarity = rarityOrder[rarityOrder.indexOf(item.rarity) + 1];
    
    const upgradedItem = generateEquipment(item.type, player.class);
    upgradedItem.rarity = newRarity;
    
    setCraftingMaterials(prev => ({
      ...prev,
      [shardType]: prev[shardType] - cost.shards
    }));
    
    setPlayer(prev => prev ? { ...prev, gold: prev.gold - cost.gold } : null);
    setInventory(prev => prev.map(i => i.id === itemId ? upgradedItem : i));
    toast.success(`Upgraded to ${newRarity}!`);
  };
  
  const handleReforge = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || !player) return;
    
    const shardType = `${item.rarity}_shard` as keyof CraftingMaterials;
    const cost = 5;
    
    if (craftingMaterials[shardType] < cost || player.gold < 50) {
      toast.error('Not enough resources!');
      return;
    }
    
    const reforgedItem = generateEquipment(item.type, player.class);
    reforgedItem.rarity = item.rarity;
    
    setCraftingMaterials(prev => ({ ...prev, [shardType]: prev[shardType] - cost }));
    setPlayer(prev => prev ? { ...prev, gold: prev.gold - 50 } : null);
    setInventory(prev => prev.map(i => i.id === itemId ? reforgedItem : i));
    toast.success('Item reforged!');
  };
  
  const handleEnchant = (itemId: string) => {
    toast.info('Enchanting coming soon!');
  };
  
  // Phase 2: Skill Tree Handlers
  const handleUnlockSkillNode = (nodeId: string) => {
    const node = skillTreeNodes.find(n => n.id === nodeId);
    if (!node || !player) return;
    
    if (skillPoints < node.cost) {
      toast.error('Not enough skill points!');
      return;
    }
    
    if (node.prerequisite) {
      const prereq = skillTreeNodes.find(n => n.id === node.prerequisite);
      if (!prereq?.unlocked) {
        toast.error('Unlock prerequisite first!');
        return;
      }
    }
    
    setSkillPoints(prev => prev - node.cost);
    setSkillTreeNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, unlocked: true } : n
    ));
    
    const updatedPlayer = { ...player };
    if (node.effect.attack) updatedPlayer.stats.attack += node.effect.attack;
    if (node.effect.defense) updatedPlayer.stats.defense += node.effect.defense;
    if (node.effect.speed) updatedPlayer.stats.speed += node.effect.speed;
    if (node.effect.health) {
      updatedPlayer.stats.maxHealth += node.effect.health;
      updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
    }
    if (node.effect.evasion) updatedPlayer.stats.evasion += node.effect.evasion;
    if (node.effect.critChance) updatedPlayer.stats.critChance += node.effect.critChance;
    if (node.effect.luck) updatedPlayer.stats.luck += node.effect.luck;
    
    setPlayer(updatedPlayer);
    toast.success(`Unlocked: ${node.name}!`);
  };

  const calculateSkillBonuses = () => {
    const bonuses = {
      attack: 0,
      defense: 0,
      speed: 0,
      maxHealth: 0,
      evasion: 0,
      critChance: 0,
      luck: 0,
    };

    acquiredSkills.forEach(skillId => {
      const skill = getSkillById(skillId);
      if (skill?.effect) {
        if (skill.effect.attack) bonuses.attack += skill.effect.attack;
        if (skill.effect.defense) bonuses.defense += skill.effect.defense;
        if (skill.effect.speed) bonuses.speed += skill.effect.speed;
        if (skill.effect.health) bonuses.maxHealth += skill.effect.health;
        if (skill.effect.evasion) bonuses.evasion += skill.effect.evasion;
        if (skill.effect.critChance) bonuses.critChance += skill.effect.critChance;
        if (skill.effect.luck) bonuses.luck += skill.effect.luck;
      }
    });

    return bonuses;
  };

  // Training Ground Handlers
  const handleTrainingStatGain = (stat: StatType, amount: number) => {
    if (!player) return;
    
    const updatedPlayer = { ...player };
    switch (stat) {
      case 'attack':
        updatedPlayer.stats.attack += amount;
        break;
      case 'defense':
        updatedPlayer.stats.defense += amount;
        break;
      case 'speed':
        updatedPlayer.stats.speed += amount;
        break;
      case 'health':
        updatedPlayer.stats.maxHealth += amount * 10;
        updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
        break;
    }
    setPlayer(updatedPlayer);
  };

  const handleTrainingGoldSpent = (amount: number) => {
    if (!player) return;
    setPlayer(prev => prev ? { ...prev, gold: prev.gold - amount } : null);
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
    
    // Apply equipment stats to current player (additive)
    const updatedPlayer = { ...player };
    
    // Remove old item stats if any
    if (currentItem && currentItem.stats) {
      Object.entries(currentItem.stats).forEach(([key, value]) => {
        if (value && key in updatedPlayer.stats) {
          (updatedPlayer.stats as any)[key] -= value;
        }
      });
    }
    
    // Add new item stats
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, value]) => {
        if (value && key in updatedPlayer.stats) {
          (updatedPlayer.stats as any)[key] += value;
        }
      });
    }
    
    // Ensure health doesn't exceed maxHealth
    updatedPlayer.stats.health = Math.min(updatedPlayer.stats.health, updatedPlayer.stats.maxHealth);
    
    setPlayer(updatedPlayer);
    
    toast.success(`Equipped ${item.name}`);
  };

  const handleUnequip = (slot: keyof EquipmentSlots) => {
    const item = equippedItems[slot];
    if (!item || !player) return;
    
    // Add to inventory
    setInventory(prev => [...prev, item]);
    
    // Remove item stats from player (subtractive)
    const updatedPlayer = { ...player };
    
    if (item.stats) {
      Object.entries(item.stats).forEach(([key, value]) => {
        if (value && key in updatedPlayer.stats) {
          (updatedPlayer.stats as any)[key] -= value;
        }
      });
    }
    
    // Ensure health doesn't exceed maxHealth
    updatedPlayer.stats.health = Math.min(updatedPlayer.stats.health, updatedPlayer.stats.maxHealth);
    
    setPlayer(updatedPlayer);
    
    // Unequip
    setEquippedItems(prev => ({
      ...prev,
      [slot]: null,
    }));
    
    toast.info(`Unequipped ${item.name}`);
  };

  const handlePurchase = (item: ShopItem) => {
    if (!player || player.gold < item.price) {
      toast.error('Not enough gold!');
      return;
    }

    const updatedPlayer = { ...player };
    updatedPlayer.gold -= item.price;

    switch (item.effect.type) {
      case 'heal':
        updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
        toast.success('Health restored!');
        break;
      
      case 'exp-boost':
        if (item.effect.value && item.effect.duration) {
          setActiveBuffs(prev => [...prev, {
            id: Math.random().toString(36),
            name: item.name,
            type: 'exp-boost',
            multiplier: item.effect.value!,
            battlesRemaining: item.effect.duration!,
          }]);
          toast.success('Exp boost active!', {
            description: `+50% exp for ${item.effect.duration} battles`,
          });
        }
        break;
      
      case 'reroll':
        if (inventory.length > 0) {
          const randomIndex = Math.floor(Math.random() * inventory.length);
          const itemToReroll = inventory[randomIndex];
          const newItem = generateEquipment(itemToReroll.type, player.class);
          const newInventory = [...inventory];
          newInventory[randomIndex] = newItem;
          setInventory(newInventory);
          toast.success(`Rerolled ${itemToReroll.name}!`, {
            description: `Got ${newItem.name}`,
          });
        } else {
          toast.error('No items to reroll!');
          updatedPlayer.gold += item.price; // Refund
        }
        break;
      
      case 'skill-token':
        const newSkill = getRandomSkill(acquiredSkills);
        setAcquiredSkills(prev => [...prev, newSkill.id]);
        
        if (newSkill.effect) {
          if (newSkill.effect.attack) updatedPlayer.stats.attack += newSkill.effect.attack;
          if (newSkill.effect.defense) updatedPlayer.stats.defense += newSkill.effect.defense;
          if (newSkill.effect.speed) updatedPlayer.stats.speed += newSkill.effect.speed;
          if (newSkill.effect.health) {
            updatedPlayer.stats.maxHealth += newSkill.effect.health;
            updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
          }
          if (newSkill.effect.evasion) updatedPlayer.stats.evasion += newSkill.effect.evasion;
          if (newSkill.effect.critChance) updatedPlayer.stats.critChance += newSkill.effect.critChance;
          if (newSkill.effect.luck) updatedPlayer.stats.luck += newSkill.effect.luck;
        }
        
        toast.success(`New Skill: ${newSkill.name}!`, {
          description: newSkill.description,
        });
        break;
    }

    setPlayer(updatedPlayer);
  };

  // Loading state while auth restores
  if (authLoading || !profileLoaded) {
    return (
      <div className="min-h-screen bg-gradient-arena flex items-center justify-center">
        <Card className="p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-foreground text-lg font-bold">Loading Arena Legends...</p>
            <p className="text-muted-foreground text-sm">Preparing your adventure</p>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'creation') {
    return <CharacterCreation onCreateCharacter={handleCreateCharacter} />;
  }

  if (gameState === 'difficulty-selection' && player) {
    return (
      <DifficultySelector
        onSelect={handleDifficultySelected}
        onCancel={handleCancelDifficultySelection}
      />
    );
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
    return <CombatArena player={player} opponentId={selectedOpponentId} difficulty={selectedDifficulty} onCombatEnd={handleCombatEnd} />;
  }

  if (gameState === 'pvp-hub' && player && user) {
    return (
      <PvPHub 
        player={player}
        userId={user.id}
        playerRating={playerRating}
        onChallengeOpponent={handlePvPChallenge}
        onBack={() => setGameState('hub')}
      />
    );
  }

  if (gameState === 'pvp-combat' && player && user) {
    return (
      <PvPCombat
        player={player}
        userId={user.id}
        playerRating={playerRating}
        opponentId={pvpOpponentId}
        opponentName={pvpOpponentName}
        onCombatEnd={handlePvPCombatEnd}
        onBack={() => setGameState('pvp-hub')}
      />
    );
  }

  if (gameState === 'boss-selection' && player) {
    return <BossSelection player={player} onSelectBoss={handleSelectBoss} onBack={() => setGameState('hub')} />;
  }

  if (gameState === 'boss-battle' && player && user) {
    return <BossBattle player={player} userId={user.id} bossId={selectedBossId} onBattleEnd={handleBossBattleEnd} onBack={() => setGameState('boss-selection')} />;
  }

  if (gameState === 'guild-hub' && player && user) {
    return <GuildHub player={player} userId={user.id} username={user.user_metadata?.username || 'Player'} onBack={() => setGameState('hub')} />;
  }

  if (gameState === 'cosmetics' && player && user) {
    return <Cosmetics player={player} userId={user.id} onBack={() => setGameState('hub')} onPurchase={(cost) => setPlayer(p => p ? {...p, gold: p.gold - cost} : p)} />;
  }

  if (gameState === 'hall-of-fame') {
    return <HallOfFame onBack={() => setGameState('hub')} />;
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

  if (gameState === 'training' && player) {
    return (
      <TrainingGround
        player={player}
        onBack={() => setGameState('hub')}
        onStatGain={handleTrainingStatGain}
        onGoldSpent={handleTrainingGoldSpent}
      />
    );
  }

  // Hub
  if (gameState === 'hub' && player) {
    const expNeeded = player.level * 100;
    const expProgress = (player.experience / expNeeded) * 100;
    const wins = battleHistory.filter(b => b.result === 'victory').length;
    const losses = battleHistory.filter(b => b.result === 'defeat').length;
    
    const getAvatarForClass = (characterClass: string) => {
      switch (characterClass) {
        case 'fighter': return warriorAvatar;
        case 'mage': return mageAvatar;
        case 'archer': return archerAvatar;
        default: return warriorAvatar;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-arena p-4">
        {/* Header with Arena Button */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="text-center mb-4">
            <h1 className="text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2 animate-float">
              Warrior's Hall
            </h1>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Coins className="w-6 h-6 text-primary" />
              <span className="text-primary">{player.gold}</span>
              <span className="text-muted-foreground text-lg">gold</span>
            </div>
          </div>
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              onClick={startNewBattle}
              className="flex-1 h-16 text-xl font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-all hover:scale-105 shadow-combat"
            >
              <Swords className="w-6 h-6 mr-2" />
              Enter Arena
            </Button>
            <Button
              onClick={() => setShopOpen(true)}
              className="h-16 px-6 text-xl font-bold bg-primary/20 border-2 border-primary hover:bg-primary/30 transition-all hover:scale-105"
            >
              <Store className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Quick Access Buttons */}
          <div className="flex gap-2 max-w-2xl mx-auto mt-4 flex-wrap justify-center">
            <Button variant="outline" size="sm" onClick={() => setQuestsOpen(true)}>
              <Target className="w-4 h-4 mr-1" />
              Quests
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAchievementsOpen(true)}>
              <Award className="w-4 h-4 mr-1" />
              Achievements
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPetsOpen(true)}>
              <Sparkles className="w-4 h-4 mr-1" />
              Pets ({collectedPets.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCraftingOpen(true)}>
              <Hammer className="w-4 h-4 mr-1" />
              Crafting
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSkillTreeOpen(true)}>
              <Zap className="w-4 w-4 mr-1" />
              Skills ({skillPoints} SP)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setGameState('training')}
            >
              <Target className="w-4 h-4 mr-1" />
              Training
            </Button>
            <Button
              variant="outline" 
              size="sm" 
              onClick={openPvPHub}
              disabled={!user}
              title={!user ? 'Loading...' : undefined}
            >
              <Trophy className="w-4 h-4 mr-1" />
              PvP Arena
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openBossSelection}
              disabled={!user}
              title={!user ? 'Loading...' : undefined}
            >
              <Skull className="w-4 h-4 mr-1" />
              Raid Bosses
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openGuildHub}
              disabled={!user}
              title={!user ? 'Loading...' : undefined}
            >
              <Users className="w-4 h-4 mr-1" />
              Guild
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openCosmetics}
              disabled={!user}
              title={!user ? 'Loading...' : undefined}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Cosmetics
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openHallOfFame}
              disabled={!user}
              title={!user ? 'Loading...' : undefined}
            >
              <Trophy className="w-4 h-4 mr-1" />
              Hall of Fame
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPrestigeModalOpen(true)}
              disabled={!user}
              title={!user ? 'Loading...' : undefined}
            >
              <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
              Prestige
            </Button>
          </div>
        </div>
        
        {/* Shop Modal */}
        <Shop 
          open={shopOpen} 
          onClose={() => setShopOpen(false)}
          playerGold={player.gold}
          onPurchase={handlePurchase}
        />
        
        {/* Phase 2 Modals */}
        <Quests
          open={questsOpen}
          onClose={() => setQuestsOpen(false)}
          dailyQuests={dailyQuests}
          weeklyQuests={weeklyQuests}
          achievementQuests={achievementQuests}
          onClaimReward={handleClaimQuestReward}
        />
        
        <Achievements
          open={achievementsOpen}
          onClose={() => setAchievementsOpen(false)}
          achievements={achievements}
          titles={TITLES}
          currentTitle={currentTitle}
          onEquipTitle={handleEquipTitle}
          onUnequipTitle={handleUnequipTitle}
        />
        
        <Pets
          open={petsOpen}
          onClose={() => setPetsOpen(false)}
          pets={collectedPets}
          activePet={activePet}
          onEquipPet={handleEquipPet}
          onUnequipPet={handleUnequipPet}
        />
        
        <Crafting
          open={craftingOpen}
          onClose={() => setCraftingOpen(false)}
          inventory={inventory}
          materials={craftingMaterials}
          onDismantle={handleDismantle}
          onUpgrade={handleUpgrade}
          onReforge={handleReforge}
          onEnchant={handleEnchant}
        />
        
        <SkillTree
          open={skillTreeOpen}
          onClose={() => setSkillTreeOpen(false)}
          nodes={skillTreeNodes}
          skillPoints={skillPoints}
          onUnlockNode={handleUnlockSkillNode}
        />

        {user && (
          <PrestigeModal
            open={prestigeModalOpen}
            onClose={() => setPrestigeModalOpen(false)}
            player={player}
            userId={user.id}
            onPrestige={handlePrestigeComplete}
          />
        )}

        {/* Main Layout: 3 columns */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Battle History */}
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
            <div className="space-y-2 max-h-[400px] overflow-y-auto styled-scrollbar">
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

          {/* Center: Character Stats */}
          <Card className="p-6 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img 
                  src={getAvatarForClass(player.class)} 
                  alt={`${player.class} avatar`}
                  className="w-full h-full object-cover rounded-full border-4 border-primary shadow-glow animate-glow-pulse"
                />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {currentTitle && TITLES[currentTitle] && (
                  <span 
                    className="block text-sm mb-1"
                    style={{ color: TITLES[currentTitle].color }}
                  >
                    {TITLES[currentTitle].name}
                  </span>
                )}
                {player.name}
                {activePet && (
                  <span className="text-4xl ml-2">{activePet.emoji}</span>
                )}
              </h2>
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

            {/* Reset Progress Button */}
            <div className="mt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Progress
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your character, inventory, and all progress. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetProgress}>
                      Reset Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>

          {/* Right: Equipment & Skills */}
          <div className="space-y-6">
            <Card className="p-4 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Backpack className="w-5 h-5 text-primary" />
                Equipment
              </h2>
              
              {/* Equipped Items */}
              <div className="mb-4">
                <h3 className="text-sm font-bold mb-2">Equipped</h3>
                <div className="space-y-1.5">
                  {(['weapon', 'armor', 'accessory'] as const).map((slot) => {
                    const item = equippedItems[slot];
                    return (
                      <div key={slot} className="p-2 bg-secondary/50 rounded border border-border">
                        <div className="text-xs text-muted-foreground capitalize mb-0.5">{slot}</div>
                        {item ? (
                          <div>
                            <p className={`text-xs font-bold ${
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
                <h3 className="text-sm font-bold mb-2">Inventory ({inventory.length})</h3>
                <TooltipProvider>
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto styled-scrollbar">
                    {inventory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-2 text-xs">
                        Defeat enemies to find loot!
                      </p>
                    ) : (
                      inventory.slice(0, 3).map((item) => (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={`p-1.5 rounded border-2 cursor-pointer hover:scale-105 transition-transform ${
                                item.rarity === 'legendary' ? 'border-[hsl(var(--rarity-legendary))]' :
                                item.rarity === 'epic' ? 'border-[hsl(var(--rarity-epic))]' :
                                item.rarity === 'rare' ? 'border-[hsl(var(--rarity-rare))]' :
                                item.rarity === 'uncommon' ? 'border-[hsl(var(--rarity-uncommon))]' :
                                'border-[hsl(var(--rarity-common))]'
                              }`}
                              onClick={() => handleEquip(item)}
                            >
                              <p className="text-xs font-bold">{item.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-card border-2 border-primary/30 p-3">
                            <div className="space-y-1">
                              <p className={`font-bold text-sm ${
                                item.rarity === 'legendary' ? 'text-[hsl(var(--rarity-legendary))]' :
                                item.rarity === 'epic' ? 'text-[hsl(var(--rarity-epic))]' :
                                item.rarity === 'rare' ? 'text-[hsl(var(--rarity-rare))]' :
                                item.rarity === 'uncommon' ? 'text-[hsl(var(--rarity-uncommon))]' :
                                'text-[hsl(var(--rarity-common))]'
                              }`}>
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">{item.rarity} {item.type}</p>
                              <div className="pt-2 space-y-0.5 border-t border-border">
                                {item.stats.attack > 0 && <p className="text-xs text-green-400">+{item.stats.attack} Attack</p>}
                                {item.stats.defense > 0 && <p className="text-xs text-green-400">+{item.stats.defense} Defense</p>}
                                {item.stats.speed > 0 && <p className="text-xs text-green-400">+{item.stats.speed} Speed</p>}
                                {item.stats.health > 0 && <p className="text-xs text-green-400">+{item.stats.health} Health</p>}
                                {item.stats.evasion > 0 && <p className="text-xs text-green-400">+{item.stats.evasion}% Evasion</p>}
                                {item.stats.critChance > 0 && <p className="text-xs text-green-400">+{item.stats.critChance}% Crit</p>}
                                {item.stats.luck > 0 && <p className="text-xs text-green-400">+{item.stats.luck} Luck</p>}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    )}
                  </div>
                </TooltipProvider>
                {inventory.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open full inventory modal
                      const modal = document.createElement('div');
                      document.body.appendChild(modal);
                    }}
                    className="w-full mt-2 text-xs h-7"
                  >
                    View All ({inventory.length})
                  </Button>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Skills acquiredSkills={acquiredSkills} />
          </div>
        </div>
      </div>
    );
  }

  // Fallback - shouldn't reach here but just in case
  return (
    <div className="min-h-screen bg-gradient-arena flex items-center justify-center">
      <Card className="p-8 bg-card/95 backdrop-blur-sm border-2 border-primary/30">
        <div className="flex flex-col items-center gap-4">
          <p className="text-foreground text-lg font-bold">Something went wrong</p>
          <p className="text-muted-foreground text-sm">Please refresh the page or create a character</p>
          <Button onClick={() => setGameState('creation')} variant="default">
            Create Character
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
