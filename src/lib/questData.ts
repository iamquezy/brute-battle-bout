import { Quest } from '@/types/quests';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export const createDailyQuests = (): Quest[] => {
  const resetTime = Date.now() + DAY_MS;
  
  return [
    {
      id: 'daily_win_3',
      name: 'Daily Warrior',
      description: 'Win 3 battles',
      type: 'daily',
      objective: 'win_battles',
      target: 3,
      progress: 0,
      completed: false,
      claimed: false,
      reward: { gold: 100 },
      resetTime,
    },
    {
      id: 'daily_damage_500',
      name: 'Damage Dealer',
      description: 'Deal 500 total damage',
      type: 'daily',
      objective: 'deal_damage',
      target: 500,
      progress: 0,
      completed: false,
      claimed: false,
      reward: { gold: 150 },
      resetTime,
    },
    {
      id: 'daily_equip_rare',
      name: 'Gear Up',
      description: 'Equip a rare or better item',
      type: 'daily',
      objective: 'equip_rarity',
      target: 1,
      progress: 0,
      completed: false,
      claimed: false,
      reward: { item: 'uncommon' },
      resetTime,
    },
  ];
};

export const createWeeklyQuests = (): Quest[] => {
  const resetTime = Date.now() + WEEK_MS;
  
  return [
    {
      id: 'weekly_level_5',
      name: 'Power Climb',
      description: 'Reach level 5',
      type: 'weekly',
      objective: 'reach_level',
      target: 5,
      progress: 0,
      completed: false,
      claimed: false,
      reward: { gold: 300, skillToken: true },
      resetTime,
    },
    {
      id: 'weekly_win_15',
      name: 'Conquest',
      description: 'Win 15 battles',
      type: 'weekly',
      objective: 'win_battles',
      target: 15,
      progress: 0,
      completed: false,
      claimed: false,
      reward: { gold: 500 },
      resetTime,
    },
    {
      id: 'weekly_skills_5',
      name: 'Skill Master',
      description: 'Acquire 5 skills',
      type: 'weekly',
      objective: 'acquire_skills',
      target: 5,
      progress: 0,
      completed: false,
      claimed: false,
      reward: { item: 'rare' },
      resetTime,
    },
  ];
};

export const ACHIEVEMENT_QUESTS: Quest[] = [
  {
    id: 'achieve_century',
    name: 'Century Fighter',
    description: 'Win 100 battles',
    type: 'achievement',
    objective: 'win_battles',
    target: 100,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { gold: 1000, title: 'century_fighter' },
  },
  {
    id: 'achieve_master',
    name: 'Master Warrior',
    description: 'Reach level 20',
    type: 'achievement',
    objective: 'reach_level',
    target: 20,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { item: 'legendary', title: 'master_warrior' },
  },
  {
    id: 'achieve_collector',
    name: 'Legendary Collector',
    description: 'Own 10 legendary items',
    type: 'achievement',
    objective: 'equip_rarity',
    target: 10,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { gold: 5000, title: 'collector' },
  },
  {
    id: 'achieve_rich',
    name: 'Golden Touch',
    description: 'Earn 10,000 total gold',
    type: 'achievement',
    objective: 'earn_gold',
    target: 10000,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { gold: 2000, title: 'merchant' },
  },
  {
    id: 'achieve_damage',
    name: 'Devastator',
    description: 'Deal 50,000 total damage',
    type: 'achievement',
    objective: 'deal_damage',
    target: 50000,
    progress: 0,
    completed: false,
    claimed: false,
    reward: { gold: 3000, title: 'devastator' },
  },
];
