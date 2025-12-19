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
import { AutoCombat } from '@/components/AutoCombat';
import { PvPHub } from '@/components/PvPHub';
import { PvPCombat } from '@/components/PvPCombat';
import { LevelUpModal } from '@/components/LevelUpModal';
import { BossSelection } from '@/components/BossSelection';
import { BossBattle } from '@/components/BossBattle';
import { GuildHub } from '@/components/GuildHub';
import { Cosmetics } from '@/components/Cosmetics';
import { HallOfFame } from '@/components/HallOfFame';
import { PrestigeModal } from '@/components/PrestigeModal';
import { ClassEvolutionModal } from '@/components/ClassEvolutionModal';
import { DeathPenaltyModal } from '@/components/DeathPenaltyModal';
import { TournamentHub } from '@/components/TournamentHub';
import { Inventory } from '@/components/Inventory';
import { Skills } from '@/components/Skills';
import { Shop } from '@/components/Shop';
import { Quests } from '@/components/Quests';
import { Achievements } from '@/components/Achievements';
import { Pets } from '@/components/Pets';
import { Crafting } from '@/components/Crafting';
import { TrainingGround } from '@/components/TrainingGround';
import { SkillTree } from '@/components/SkillTree';
import { WinStreakDisplay } from '@/components/WinStreakDisplay';
import { SessionProgress } from '@/components/SessionProgress';
import { HourlyChallenges } from '@/components/HourlyChallenges';
import { AchievementNotification } from '@/components/AchievementNotification';
import { EquipmentEnhancement } from '@/components/EquipmentEnhancement';
import { SpecializationModal } from '@/components/SpecializationModal';
import { BuildManager } from '@/components/BuildManager';
import { LeaderboardRewards } from '@/components/LeaderboardRewards';
import { WorldBoss } from '@/components/WorldBoss';
import { SeasonalEvents } from '@/components/SeasonalEvents';
import { MythicPlusHub } from '@/components/MythicPlusHub';
import { PublicGuildView } from '@/components/PublicGuildView';
import { GameHub } from '@/components/GameHub';
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
import { createHourlyChallenges, shouldResetHourlyChallenges, HourlyChallenge } from '@/lib/hourlyChallenges';
import { attemptEnhancement, calculateEnhancedStats } from '@/lib/enhancementSystem';
import { SPECIALIZATIONS } from '@/lib/specializationData';
import { SpecializationId } from '@/types/specialization';
import { rollPetDrop, PET_LIBRARY } from '@/lib/petData';
import { getSkillTreeForClass } from '@/lib/skillTreeData';
import { saveGame, loadGame, clearGame } from '@/lib/saveGame';
import { Trophy, Swords, Backpack, Store, Coins, Target, Award, Sparkles, Hammer, Zap, RotateCcw, LogOut, Skull, Shield, Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';

type GameState = 'creation' | 'hub' | 'opponent-selection' | 'difficulty-selection' | 'combat' | 'levelup' | 'pvp-hub' | 'pvp-combat' | 'boss-selection' | 'boss-battle' | 'guild-hub' | 'cosmetics' | 'hall-of-fame' | 'training' | 'tournament-hub' | 'world-boss' | 'seasonal-events' | 'mythic-plus' | 'public-guilds';

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

  // Phase 2 Enhancement: Win Streaks
  const [winStreak, setWinStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  
  // Phase 2 Enhancement: Session Progress
  const [sessionStats, setSessionStats] = useState({
    wins: 0,
    totalBattles: 0,
    damageDealt: 0,
    goldEarned: 0,
    criticalHits: 0,
    perfectTimings: 0,
    startTime: Date.now(),
  });
  const [sessionRewardsClaimed, setSessionRewardsClaimed] = useState<number[]>([]);
  
  // Phase 2 Enhancement: Hourly Challenges
  const [hourlyChallenges, setHourlyChallenges] = useState<any[]>([]);
  const [lastHourlyReset, setLastHourlyReset] = useState(Date.now());
  
  // Phase 2 Enhancement: Achievement Notifications
  const [achievementNotification, setAchievementNotification] = useState<{
    show: boolean;
    title: string;
    description: string;
  }>({ show: false, title: '', description: '' });
  
  // Phase 3: Equipment Enhancement
  const [enhancementModalOpen, setEnhancementModalOpen] = useState(false);
  const [selectedEquipmentForEnhancement, setSelectedEquipmentForEnhancement] = useState<Equipment | null>(null);
  
  // Phase 3: Character Specialization
  const [specializationModalOpen, setSpecializationModalOpen] = useState(false);
  const [characterSpecialization, setCharacterSpecialization] = useState<SpecializationId | null>(null);
  
  // Phase 3: Build Manager
  const [buildManagerOpen, setBuildManagerOpen] = useState(false);
  
  // Phase 4: Leaderboard Rewards
  const [leaderboardRewardsOpen, setLeaderboardRewardsOpen] = useState(false);
  
  // Phase 5: Endgame Content
  const [selectedMythicDungeon, setSelectedMythicDungeon] = useState<string>('');
  const [selectedMythicLevel, setSelectedMythicLevel] = useState<number>(1);

  // Phase 3: PvP System
  const [playerRating, setPlayerRating] = useState(1000);
  const [pvpOpponentId, setPvpOpponentId] = useState<string>('');
  const [pvpOpponentName, setPvpOpponentName] = useState<string>('');
  const [pvpWinStreak, setPvpWinStreak] = useState(0);

  // Phase 4: Content Expansion
  const [selectedBossId, setSelectedBossId] = useState<string>('');
  const [prestigeModalOpen, setPrestigeModalOpen] = useState(false);
  
  // Sprint Features
  const [classEvolutionModalOpen, setClassEvolutionModalOpen] = useState(false);
  const [deathPenaltyModalOpen, setDeathPenaltyModalOpen] = useState(false);
  const [deathPenaltyData, setDeathPenaltyData] = useState<{goldLost: number; itemLost: any}>({goldLost: 0, itemLost: null});

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
          
          // Initialize hourly challenges if needed (using type assertion for new properties)
          const extendedData = data as any;
          const hasHourlyChallenges = extendedData.hourlyChallenges && Array.isArray(extendedData.hourlyChallenges);
          const lastReset = extendedData.lastHourlyReset || 0;
          if (!hasHourlyChallenges || shouldResetHourlyChallenges(lastReset)) {
            setHourlyChallenges(createHourlyChallenges());
            setLastHourlyReset(now);
          } else {
            setHourlyChallenges(extendedData.hourlyChallenges);
            setLastHourlyReset(lastReset);
          }
          
          // Load Phase 2 data
          if (extendedData.winStreak !== undefined) setWinStreak(extendedData.winStreak);
          if (extendedData.bestStreak !== undefined) setBestStreak(extendedData.bestStreak);
          if (extendedData.sessionStats) setSessionStats(extendedData.sessionStats);
          if (extendedData.sessionRewardsClaimed) setSessionRewardsClaimed(extendedData.sessionRewardsClaimed);

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

  const handleCreateCharacter = (
    name: string, 
    characterClass: Character['class'],
    statAllocation: { str: number; dex: number; int: number; vit: number },
    starterPetId: string
  ) => {
    const newCharacter = createCharacter(name, characterClass);
    
    // Apply stat bonuses from allocation
    newCharacter.stats.attack += statAllocation.str * 2;
    newCharacter.stats.maxHealth += statAllocation.str + statAllocation.vit * 10;
    newCharacter.stats.health = newCharacter.stats.maxHealth;
    newCharacter.stats.speed += statAllocation.dex * 2;
    newCharacter.stats.critChance += statAllocation.dex;
    newCharacter.stats.attack += Math.floor(statAllocation.int * 1.5);
    newCharacter.stats.evasion += statAllocation.int;
    newCharacter.stats.defense += statAllocation.vit;

    setPlayer(newCharacter);
    
    // Add starter pet
    const starterPet = PET_LIBRARY.find(p => p.id === starterPetId);
    if (starterPet) {
      const newPet = {
        ...starterPet,
        id: `${starterPet.id}_starter`,
        level: 1,
        experience: 0
      };
      setCollectedPets([newPet]);
      setActivePet(newPet);
    }
    
    // Initialize Phase 2 systems
    setDailyQuests(createDailyQuests());
    setWeeklyQuests(createWeeklyQuests());
    setAchievementQuests([...ACHIEVEMENT_QUESTS]);
    setAchievements([...ACHIEVEMENTS]);
    setSkillTreeNodes(getSkillTreeForClass(characterClass).nodes);
    setHourlyChallenges(createHourlyChallenges());
    setLastHourlyReset(Date.now());
    
    // Initialize the title from default achievement
    setCurrentTitle('rookie');
    
    setGameState('hub');
  };

  const handleCombatEnd = (victory: boolean, expGained: number, goldGained: number, opponentName?: string, stats?: { damageDealt: number; critsLanded: number; perfectTimings: number }) => {
    if (!player) return;

    // Update combat stats and handle victory/defeat
    if (victory && stats) {
      const bonusGold = handleCombatVictory(goldGained, stats.damageDealt, stats.critsLanded, stats.perfectTimings);
      goldGained += bonusGold;
    } else if (!victory) {
      handleCombatDefeat();
    }

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
        setAchievementNotification({
          show: true,
          title: ach.name,
          description: ach.description,
        });
        if (ach.unlocksTitle) {
          toast.success(`New title unlocked: ${TITLES[ach.unlocksTitle].name}!`);
        }
      }
      
      return { ...ach, progress: newProgress, completed: isCompleted };
    }));
  };
  
  // Phase 2: Win Streak Handler
  const handleCombatVictory = (goldEarned: number, damageDealt: number, crits: number, perfectTimings: number = 0) => {
    // Update win streak
    const newStreak = winStreak + 1;
    setWinStreak(newStreak);
    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
      if (newStreak % 5 === 0) {
        toast.success(`${newStreak} Win Streak! 🔥`, {
          description: `Bonus: +${Math.floor(newStreak / 3) * 10}% gold`
        });
      }
    }
    
    // Apply streak bonus to gold
    const streakBonus = Math.floor(newStreak / 3) * 0.1;
    const bonusGold = Math.floor(goldEarned * streakBonus);
    
    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      wins: prev.wins + 1,
      totalBattles: prev.totalBattles + 1,
      damageDealt: prev.damageDealt + damageDealt,
      goldEarned: prev.goldEarned + goldEarned + bonusGold,
      criticalHits: prev.criticalHits + crits,
      perfectTimings: prev.perfectTimings + perfectTimings,
    }));
    
    // Update hourly challenges
    setHourlyChallenges(prev => prev.map(challenge => {
      if (challenge.completed) return challenge;
      
      let progress = challenge.progress;
      if (challenge.objective === 'win_battles') progress += 1;
      if (challenge.objective === 'deal_damage') progress += damageDealt;
      if (challenge.objective === 'land_crits') progress += crits;
      if (challenge.objective === 'perfect_timing') progress += perfectTimings;
      
      const completed = progress >= challenge.target;
      if (completed && !challenge.completed) {
        toast.success(`Challenge Complete: ${challenge.name}!`);
      }
      
      return { ...challenge, progress, completed };
    }));
    
    return bonusGold;
  };
  
  const handleCombatDefeat = () => {
    setWinStreak(0);
    setSessionStats(prev => ({
      ...prev,
      totalBattles: prev.totalBattles + 1,
    }));
  };
  
  const handleClaimSessionReward = (tier: number) => {
    if (sessionRewardsClaimed.includes(tier)) return;
    
    const rewards = [
      { gold: 100 },
      { gold: 0, item: true },
      { gold: 300, skillToken: true },
      { gold: 0, item: true },
      { gold: 1000, item: true },
    ];
    
    const reward = rewards[tier - 1];
    if (!player) return;
    
    const updatedPlayer = { ...player };
    if (reward.gold) updatedPlayer.gold += reward.gold;
    if (reward.item) {
      const rarity = tier === 2 ? 'rare' : tier === 4 ? 'epic' : 'legendary';
      const loot = generateEquipment(
        ['weapon', 'armor', 'accessory'][Math.floor(Math.random() * 3)] as any,
        player.class
      );
      setInventory(prev => [...prev, loot]);
    }
    if (reward.skillToken) {
      setSkillPoints(prev => prev + 1);
    }
    
    setPlayer(updatedPlayer);
    setSessionRewardsClaimed(prev => [...prev, tier]);
    toast.success('Session reward claimed!');
  };
  
  // Phase 3: Equipment Enhancement Handlers
  const handleOpenEnhancement = (equipment: Equipment) => {
    setSelectedEquipmentForEnhancement(equipment);
    setEnhancementModalOpen(true);
  };
  
  const handleEnhanceEquipment = (equipment: Equipment, useProtection: boolean) => {
    if (!player) return;
    
    const result = attemptEnhancement(equipment, useProtection);
    
    if (result.destroyed) {
      // Remove from inventory or equipped
      setInventory(prev => prev.filter(item => item.id !== equipment.id));
      Object.entries(equippedItems).forEach(([slot, item]) => {
        if (item?.id === equipment.id) {
          setEquippedItems(prev => ({ ...prev, [slot]: null }));
        }
      });
      toast.error(result.message);
    } else {
      // Update equipment enhancement level
      const updatedEquipment = { ...equipment, enhancementLevel: result.newLevel };
      const enhancedEquipment = calculateEnhancedStats(updatedEquipment);
      
      // Update in inventory or equipped
      setInventory(prev => 
        prev.map(item => item.id === equipment.id ? enhancedEquipment : item)
      );
      
      Object.entries(equippedItems).forEach(([slot, item]) => {
        if (item?.id === equipment.id) {
          setEquippedItems(prev => ({ ...prev, [slot]: enhancedEquipment }));
        }
      });
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
    
    setEnhancementModalOpen(false);
  };
  
  // Phase 3: Specialization Handlers
  const handleSelectSpecialization = (specializationId: string) => {
    if (!player || player.level < 10) {
      toast.error('You need to reach level 10 to specialize!');
      return;
    }
    
    if (characterSpecialization) {
      toast.error('You have already chosen a specialization!');
      return;
    }
    
    const spec = SPECIALIZATIONS[specializationId];
    if (!spec) return;
    
    setCharacterSpecialization(spec.id);
    
    // Apply specialization bonuses
    const updatedPlayer = { ...player };
    if (spec.bonuses.attack) updatedPlayer.stats.attack += spec.bonuses.attack;
    if (spec.bonuses.defense) updatedPlayer.stats.defense += spec.bonuses.defense;
    if (spec.bonuses.speed) updatedPlayer.stats.speed += spec.bonuses.speed;
    if (spec.bonuses.health) {
      updatedPlayer.stats.maxHealth += spec.bonuses.health;
      updatedPlayer.stats.health = updatedPlayer.stats.maxHealth;
    }
    if (spec.bonuses.evasion) updatedPlayer.stats.evasion += spec.bonuses.evasion;
    if (spec.bonuses.critChance) updatedPlayer.stats.critChance += spec.bonuses.critChance;
    if (spec.bonuses.luck) updatedPlayer.stats.luck += spec.bonuses.luck;
    
    setPlayer(updatedPlayer);
    toast.success(`You are now a ${spec.name}!`, {
      description: spec.uniqueAbility.name + ' ability unlocked!',
    });
  };
  
  // Phase 4: Leaderboard Rewards Handler
  const handleClaimLeaderboardReward = (rewards: any) => {
    if (!player) return;
    
    let updatedPlayer = { ...player };
    
    if (rewards.gold) {
      updatedPlayer.gold += rewards.gold;
    }
    
    setPlayer(updatedPlayer);
    toast.success('Leaderboard rewards claimed!');
  };
  
  // Phase 5: Mythic+ Handler
  const handleStartMythicRun = (dungeonId: string, level: number) => {
    setSelectedMythicDungeon(dungeonId);
    setSelectedMythicLevel(level);
    toast.success(`Starting Mythic +${level} run!`, {
      description: 'Feature coming soon - will launch dungeon run'
    });
  };
  
  // Phase 3: Build Management Handlers
  const handleLoadBuild = (build: any) => {
    if (!player) return;
    
    const buildData = build.character_data;
    
    // Load stats (but preserve level and XP)
    const updatedPlayer = { ...player };
    updatedPlayer.stats = { ...buildData.stats };
    
    setPlayer(updatedPlayer);
    setEquippedItems(buildData.equipment || { weapon: null, armor: null, accessory: null });
    setAcquiredSkills(buildData.skills || []);
    setCharacterSpecialization(buildData.specialization || null);
    
    toast.success('Build loaded successfully!');
  };
  
  const handleClaimHourlyChallenge = (challengeId: string) => {
    const challenge = hourlyChallenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.completed || challenge.claimed || !player) return;
    
    const updatedPlayer = { ...player };
    if (challenge.reward.gold) updatedPlayer.gold += challenge.reward.gold;
    if (challenge.reward.exp) updatedPlayer.experience += challenge.reward.exp;
    if (challenge.reward.item) {
      const loot = generateEquipment(
        ['weapon', 'armor', 'accessory'][Math.floor(Math.random() * 3)] as any,
        player.class
      );
      setInventory(prev => [...prev, loot]);
    }
    
    setPlayer(updatedPlayer);
    setHourlyChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, claimed: true } : c
    ));
    toast.success('Challenge reward claimed!');
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
    return <AutoCombat player={player} opponentId={selectedOpponentId} difficulty={selectedDifficulty} onCombatEnd={handleCombatEnd} />;
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

  if (gameState === 'tournament-hub' && player && user) {
    return (
      <TournamentHub 
        userId={user.id}
        playerRating={playerRating}
        playerLevel={player.level}
        onBack={() => setGameState('hub')}
      />
    );
  }

  if (gameState === 'world-boss' && player && user) {
    return (
      <WorldBoss 
        userId={user.id}
        player={player}
        onBack={() => setGameState('hub')}
      />
    );
  }

  if (gameState === 'seasonal-events' && player && user) {
    return (
      <SeasonalEvents 
        userId={user.id}
        onBack={() => setGameState('hub')}
      />
    );
  }

  if (gameState === 'mythic-plus' && player && user) {
    return (
      <MythicPlusHub 
        userId={user.id}
        player={player}
        onStartRun={handleStartMythicRun}
        onBack={() => setGameState('hub')}
      />
    );
  }

  if (gameState === 'public-guilds' && player && user) {
    return (
      <PublicGuildView 
        userId={user.id}
        onBack={() => setGameState('hub')}
        onChallengePvP={(opponentId, opponentName) => {
          setPvpOpponentId(opponentId);
          setPvpOpponentName(opponentName);
          setGameState('pvp-combat');
        }}
      />
    );
  }

  // Hub - Clean, minimal design with 4 main actions
  if (gameState === 'hub' && player) {
    return (
      <>
        <GameHub
          player={player}
          equippedItems={equippedItems}
          battleHistory={battleHistory}
          winStreak={winStreak}
          skillPoints={skillPoints}
          onStartBattle={startNewBattle}
          onOpenPvP={openPvPHub}
          onOpenGuild={() => setGameState('public-guilds')}
          onOpenInventory={() => {
            // Show inventory inline - handled by modals below
            toast.info('Opening inventory...');
          }}
          onOpenSkills={() => setSkillTreeOpen(true)}
          onOpenShop={() => setShopOpen(true)}
          onOpenQuests={() => setQuestsOpen(true)}
          onOpenBosses={() => setGameState('world-boss')}
          onOpenSettings={() => {}}
          onSignOut={signOut}
        />
        
        {/* All Modals */}
        <Shop 
          open={shopOpen} 
          onClose={() => setShopOpen(false)}
          playerGold={player.gold}
          onPurchase={handlePurchase}
        />
        
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
        
        <EquipmentEnhancement
          open={enhancementModalOpen}
          onClose={() => setEnhancementModalOpen(false)}
          equipment={selectedEquipmentForEnhancement}
          playerGold={player?.gold || 0}
          materials={craftingMaterials}
          onEnhance={handleEnhanceEquipment}
        />
        
        <SpecializationModal
          open={specializationModalOpen}
          onClose={() => setSpecializationModalOpen(false)}
          characterClass={player.class}
          currentLevel={player.level}
          currentSpecialization={characterSpecialization}
          onSelectSpecialization={handleSelectSpecialization}
        />
        
        {user && (
          <>
            <BuildManager
              open={buildManagerOpen}
              onClose={() => setBuildManagerOpen(false)}
              currentCharacter={player}
              currentEquipment={equippedItems}
              currentSkills={acquiredSkills}
              currentSpecialization={characterSpecialization}
              userId={user.id}
              onLoadBuild={handleLoadBuild}
            />
            
            <LeaderboardRewards
              open={leaderboardRewardsOpen}
              onClose={() => setLeaderboardRewardsOpen(false)}
              userId={user.id}
              onClaimReward={handleClaimLeaderboardReward}
            />

            <PrestigeModal
              open={prestigeModalOpen}
              onClose={() => setPrestigeModalOpen(false)}
              player={player}
              userId={user.id}
              onPrestige={handlePrestigeComplete}
            />
          </>
        )}

        <AchievementNotification
          show={achievementNotification.show}
          title={achievementNotification.title}
          description={achievementNotification.description}
          onComplete={() => setAchievementNotification({ show: false, title: '', description: '' })}
        />
      </>
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
