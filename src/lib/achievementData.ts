import { Achievement, Title } from '@/types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  // Combat Achievements
  {
    id: 'ach_novice_fighter',
    name: 'Novice Fighter',
    description: 'Win 10 battles',
    category: 'combat',
    tier: 'bronze',
    requirement: 10,
    progress: 0,
    completed: false,
  },
  {
    id: 'ach_veteran_warrior',
    name: 'Veteran Warrior',
    description: 'Win 50 battles',
    category: 'combat',
    tier: 'silver',
    requirement: 50,
    progress: 0,
    completed: false,
    unlocksTitle: 'veteran',
  },
  {
    id: 'ach_champion',
    name: 'Champion',
    description: 'Win 200 battles',
    category: 'combat',
    tier: 'gold',
    requirement: 200,
    progress: 0,
    completed: false,
    unlocksTitle: 'champion',
  },
  {
    id: 'ach_critical_master',
    name: 'Critical Master',
    description: 'Land 50 critical hits',
    category: 'combat',
    tier: 'silver',
    requirement: 50,
    progress: 0,
    completed: false,
  },
  {
    id: 'ach_untouchable',
    name: 'Untouchable',
    description: 'Evade 100 attacks',
    category: 'mastery',
    tier: 'silver',
    requirement: 100,
    progress: 0,
    completed: false,
    unlocksTitle: 'untouchable',
  },
  
  // Progression Achievements
  {
    id: 'ach_rising_star',
    name: 'Rising Star',
    description: 'Reach level 5',
    category: 'progression',
    tier: 'bronze',
    requirement: 5,
    progress: 0,
    completed: false,
  },
  {
    id: 'ach_hero',
    name: 'Hero',
    description: 'Reach level 15',
    category: 'progression',
    tier: 'silver',
    requirement: 15,
    progress: 0,
    completed: false,
    unlocksTitle: 'hero',
  },
  {
    id: 'ach_legend',
    name: 'Legend',
    description: 'Reach level 30',
    category: 'progression',
    tier: 'gold',
    requirement: 30,
    progress: 0,
    completed: false,
    unlocksTitle: 'legend',
  },
  
  // Collection Achievements
  {
    id: 'ach_treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Find 10 items',
    category: 'collection',
    tier: 'bronze',
    requirement: 10,
    progress: 0,
    completed: false,
  },
  {
    id: 'ach_legendary_collector',
    name: 'Legendary Collector',
    description: 'Own 5 legendary items',
    category: 'collection',
    tier: 'platinum',
    requirement: 5,
    progress: 0,
    completed: false,
    unlocksTitle: 'collector',
  },
  
  // Mastery Achievements
  {
    id: 'ach_glass_cannon',
    name: 'Glass Cannon',
    description: 'Win a battle with less than 10% health',
    category: 'mastery',
    tier: 'gold',
    requirement: 1,
    progress: 0,
    completed: false,
    unlocksTitle: 'fearless',
  },
  {
    id: 'ach_wealthy',
    name: 'Wealthy Warrior',
    description: 'Earn 10,000 total gold',
    category: 'progression',
    tier: 'silver',
    requirement: 10000,
    progress: 0,
    completed: false,
  },
];

export const TITLES: Record<string, Title> = {
  century_fighter: {
    id: 'century_fighter',
    name: 'Century Fighter',
    color: 'hsl(var(--primary))',
    description: 'Won 100 battles',
  },
  master_warrior: {
    id: 'master_warrior',
    name: 'Master Warrior',
    color: 'hsl(45, 100%, 60%)', // gold
    description: 'Reached level 20',
  },
  collector: {
    id: 'collector',
    name: 'The Collector',
    color: 'hsl(280, 100%, 70%)', // purple
    description: 'Master of legendary items',
  },
  merchant: {
    id: 'merchant',
    name: 'Merchant',
    color: 'hsl(142, 76%, 50%)', // green
    description: 'Accumulated great wealth',
  },
  devastator: {
    id: 'devastator',
    name: 'Devastator',
    color: 'hsl(0, 100%, 60%)', // red
    description: 'Dealt massive damage',
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    color: 'hsl(210, 70%, 60%)', // blue
    description: 'Experienced warrior',
  },
  champion: {
    id: 'champion',
    name: 'Champion',
    color: 'hsl(45, 100%, 50%)', // bright gold
    description: 'Arena champion',
  },
  untouchable: {
    id: 'untouchable',
    name: 'Untouchable',
    color: 'hsl(180, 100%, 60%)', // cyan
    description: 'Master of evasion',
  },
  hero: {
    id: 'hero',
    name: 'Hero',
    color: 'hsl(30, 100%, 60%)', // orange
    description: 'Rising power',
  },
  legend: {
    id: 'legend',
    name: 'Legend',
    color: 'hsl(45, 100%, 70%)', // golden yellow
    description: 'Legendary warrior',
  },
  fearless: {
    id: 'fearless',
    name: 'Fearless',
    color: 'hsl(350, 100%, 60%)', // crimson
    description: 'Thrives in danger',
  },
};
