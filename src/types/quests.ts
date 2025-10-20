export type QuestType = 'daily' | 'weekly' | 'achievement';

export type QuestObjective = 
  | 'win_battles' 
  | 'deal_damage' 
  | 'reach_level' 
  | 'equip_rarity' 
  | 'acquire_skills' 
  | 'earn_gold';

export interface QuestReward {
  gold?: number;
  exp?: number;
  item?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  skillToken?: boolean;
  title?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  objective: QuestObjective;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: QuestReward;
  resetTime?: number; // timestamp for daily/weekly reset
}
