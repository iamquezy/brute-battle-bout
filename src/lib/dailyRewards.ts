export interface DailyReward {
  day: number;
  gold: number;
  item?: 'health_potion' | 'exp_boost' | 'skill_token';
  description: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, gold: 50, description: '50 Gold' },
  { day: 2, gold: 75, description: '75 Gold' },
  { day: 3, gold: 100, item: 'health_potion', description: '100 Gold + Health Potion' },
  { day: 4, gold: 125, description: '125 Gold' },
  { day: 5, gold: 150, item: 'exp_boost', description: '150 Gold + XP Boost' },
  { day: 6, gold: 200, description: '200 Gold' },
  { day: 7, gold: 300, item: 'skill_token', description: '300 Gold + Skill Token' },
];

export const getDailyReward = (loginStreak: number): DailyReward => {
  const day = ((loginStreak - 1) % 7) + 1;
  return DAILY_REWARDS[day - 1];
};

export const shouldShowDailyReward = (lastLoginDate: number): boolean => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return (now - lastLoginDate) >= oneDayMs;
};

export const calculateLoginStreak = (lastLoginDate: number, currentStreak: number): number => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const twoDaysMs = 2 * oneDayMs;
  
  const timeSinceLastLogin = now - lastLoginDate;
  
  // If more than 2 days, streak resets
  if (timeSinceLastLogin >= twoDaysMs) {
    return 1;
  }
  
  // If less than 1 day, keep current streak
  if (timeSinceLastLogin < oneDayMs) {
    return currentStreak;
  }
  
  // Otherwise, increment streak
  return currentStreak + 1;
};

