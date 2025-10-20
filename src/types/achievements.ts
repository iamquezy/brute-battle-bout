export type AchievementCategory = 'combat' | 'progression' | 'collection' | 'mastery';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Title {
  id: string;
  name: string;
  color: string; // HSL color
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  requirement: number;
  progress: number;
  completed: boolean;
  unlocksTitle?: string; // title id
}

export interface AchievementStats {
  totalWins: number;
  totalLosses: number;
  totalDamageDealt: number;
  criticalHits: number;
  attacksEvaded: number;
  itemsFound: number;
  legendaryItemsOwned: number;
  skillsAcquired: number;
  goldEarned: number;
  lowHealthWins: number; // wins with <10% health
}
