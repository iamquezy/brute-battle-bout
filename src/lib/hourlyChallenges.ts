export interface HourlyChallenge {
  id: string;
  name: string;
  description: string;
  objective: 'win_battles' | 'deal_damage' | 'land_crits' | 'perfect_timing' | 'combo_chain';
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    gold?: number;
    item?: 'common' | 'uncommon' | 'rare';
    exp?: number;
  };
  expiresAt: number;
}

const HOUR_MS = 60 * 60 * 1000;

export const createHourlyChallenges = (): HourlyChallenge[] => {
  const expiresAt = Date.now() + HOUR_MS;
  
  const challenges: Omit<HourlyChallenge, 'progress' | 'completed' | 'claimed' | 'expiresAt'>[] = [
    {
      id: 'hourly_quick_wins',
      name: 'Speed Demon',
      description: 'Win 3 battles',
      objective: 'win_battles',
      target: 3,
      reward: { gold: 75, exp: 50 },
    },
    {
      id: 'hourly_damage',
      name: 'Heavy Hitter',
      description: 'Deal 300 total damage',
      objective: 'deal_damage',
      target: 300,
      reward: { gold: 100 },
    },
    {
      id: 'hourly_crits',
      name: 'Critical Master',
      description: 'Land 5 critical hits',
      objective: 'land_crits',
      target: 5,
      reward: { item: 'uncommon' },
    },
    {
      id: 'hourly_timing',
      name: 'Perfect Precision',
      description: 'Get 3 perfect timing attacks',
      objective: 'perfect_timing',
      target: 3,
      reward: { gold: 150 },
    },
  ];

  // Randomly select 2 challenges per hour
  const shuffled = challenges.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);

  return selected.map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false,
    claimed: false,
    expiresAt,
  }));
};

export const shouldResetHourlyChallenges = (lastReset: number): boolean => {
  return Date.now() - lastReset >= HOUR_MS;
};

export const getTimeRemaining = (expiresAt: number): string => {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return 'Expired';
  
  const minutes = Math.floor(remaining / 1000 / 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};