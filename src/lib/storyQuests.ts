import { CharacterClass } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';

export interface StoryQuestStep {
  step: number;
  title: string;
  description: string;
  objective: string;
  requirement: {
    type: 'win_battles' | 'craft_item' | 'defeat_boss' | 'pvp_wins' | 'reach_level' | 'equip_item';
    target: number;
    specificTarget?: string;
  };
  reward: {
    gold?: number;
    exp?: number;
    item?: string;
    title?: string;
  };
}

export interface StoryQuestChain {
  id: string;
  class: CharacterClass;
  name: string;
  description: string;
  steps: StoryQuestStep[];
  finalReward: {
    gold: number;
    item: string;
    title: string;
    cosmetic: string;
  };
}

export const STORY_QUEST_CHAINS: Record<CharacterClass, StoryQuestChain> = {
  fighter: {
    id: 'fighter_legend',
    class: 'fighter',
    name: 'The Way of the Warrior',
    description: 'Prove yourself as the ultimate warrior through trials of strength and honor',
    steps: [
      {
        step: 1,
        title: 'Prove Your Worth',
        description: 'Every warrior must prove themselves in combat',
        objective: 'Win 5 battles',
        requirement: { type: 'win_battles', target: 5 },
        reward: { gold: 200, exp: 100 }
      },
      {
        step: 2,
        title: 'Forge Your Blade',
        description: 'A warrior is nothing without their weapon',
        objective: 'Craft an iron sword',
        requirement: { type: 'craft_item', target: 1, specificTarget: 'iron_sword' },
        reward: { gold: 300, exp: 150 }
      },
      {
        step: 3,
        title: 'Trial of Strength',
        description: 'Defeat a mighty boss to prove your power',
        objective: 'Defeat a boss',
        requirement: { type: 'defeat_boss', target: 1 },
        reward: { gold: 500, exp: 300 }
      },
      {
        step: 4,
        title: 'Arena Champion',
        description: 'Test your might against worthy opponents',
        objective: 'Win 10 PvP matches',
        requirement: { type: 'pvp_wins', target: 10 },
        reward: { gold: 800, exp: 500 }
      },
      {
        step: 5,
        title: 'Master of Combat',
        description: 'Reach the pinnacle of warrior training',
        objective: 'Reach level 30',
        requirement: { type: 'reach_level', target: 30 },
        reward: { gold: 1500, exp: 1000 }
      },
      {
        step: 6,
        title: 'Legendary Armor',
        description: 'Equip yourself with legendary gear',
        objective: 'Equip a legendary item',
        requirement: { type: 'equip_item', target: 1, specificTarget: 'legendary' },
        reward: { gold: 2000, exp: 1500 }
      },
      {
        step: 7,
        title: 'Undefeated',
        description: 'Prove your dominance in the arena',
        objective: 'Win 5 PvP matches in a row',
        requirement: { type: 'pvp_wins', target: 5 },
        reward: { gold: 3000, exp: 2000 }
      },
      {
        step: 8,
        title: 'Boss Slayer',
        description: 'Defeat the mightiest foes',
        objective: 'Defeat 5 bosses',
        requirement: { type: 'defeat_boss', target: 5 },
        reward: { gold: 4000, exp: 3000 }
      },
      {
        step: 9,
        title: 'Warrior Elite',
        description: 'Join the ranks of elite warriors',
        objective: 'Reach level 50',
        requirement: { type: 'reach_level', target: 50 },
        reward: { gold: 6000, exp: 5000 }
      },
      {
        step: 10,
        title: 'Become Legend',
        description: 'Achieve an unbroken win streak and claim your legend',
        objective: 'Win 10 PvP matches in a row',
        requirement: { type: 'pvp_wins', target: 10 },
        reward: { gold: 10000, title: 'The Unbreakable' }
      }
    ],
    finalReward: {
      gold: 10000,
      item: 'legendary_warrior_blade',
      title: 'The Unbreakable',
      cosmetic: 'warrior_legend_aura'
    }
  },
  mage: {
    id: 'mage_legend',
    class: 'mage',
    name: 'Path of the Arcane',
    description: 'Master the mystical arts and become the ultimate sorcerer',
    steps: [
      {
        step: 1,
        title: 'First Incantation',
        description: 'Begin your journey into the arcane',
        objective: 'Win 5 battles',
        requirement: { type: 'win_battles', target: 5 },
        reward: { gold: 200, exp: 100 }
      },
      {
        step: 2,
        title: 'Craft Your Staff',
        description: 'Every mage needs a focus for their power',
        objective: 'Craft a mystic staff',
        requirement: { type: 'craft_item', target: 1, specificTarget: 'mystic_staff' },
        reward: { gold: 300, exp: 150 }
      },
      {
        step: 3,
        title: 'Trial of Magic',
        description: 'Use your magic to defeat a powerful boss',
        objective: 'Defeat a boss',
        requirement: { type: 'defeat_boss', target: 1 },
        reward: { gold: 500, exp: 300 }
      },
      {
        step: 4,
        title: 'Spell Duel',
        description: 'Test your magic against other mages',
        objective: 'Win 10 PvP matches',
        requirement: { type: 'pvp_wins', target: 10 },
        reward: { gold: 800, exp: 500 }
      },
      {
        step: 5,
        title: 'Arcane Master',
        description: 'Reach new heights of magical power',
        objective: 'Reach level 30',
        requirement: { type: 'reach_level', target: 30 },
        reward: { gold: 1500, exp: 1000 }
      },
      {
        step: 6,
        title: 'Legendary Robes',
        description: 'Don the robes of a true archmage',
        objective: 'Equip a legendary item',
        requirement: { type: 'equip_item', target: 1, specificTarget: 'legendary' },
        reward: { gold: 2000, exp: 1500 }
      },
      {
        step: 7,
        title: 'Spell Supremacy',
        description: 'Dominate the magical arena',
        objective: 'Win 5 PvP matches in a row',
        requirement: { type: 'pvp_wins', target: 5 },
        reward: { gold: 3000, exp: 2000 }
      },
      {
        step: 8,
        title: 'Monster Vanquisher',
        description: 'Use your spells to destroy mighty beasts',
        objective: 'Defeat 5 bosses',
        requirement: { type: 'defeat_boss', target: 5 },
        reward: { gold: 4000, exp: 3000 }
      },
      {
        step: 9,
        title: 'Sorcerer Supreme',
        description: 'Ascend to the highest level of magical mastery',
        objective: 'Reach level 50',
        requirement: { type: 'reach_level', target: 50 },
        reward: { gold: 6000, exp: 5000 }
      },
      {
        step: 10,
        title: 'Become Legend',
        description: 'Prove yourself as the greatest mage of all time',
        objective: 'Win 10 PvP matches in a row',
        requirement: { type: 'pvp_wins', target: 10 },
        reward: { gold: 10000, title: 'The Omniscient' }
      }
    ],
    finalReward: {
      gold: 10000,
      item: 'legendary_arcane_staff',
      title: 'The Omniscient',
      cosmetic: 'mage_legend_aura'
    }
  },
  archer: {
    id: 'archer_legend',
    class: 'archer',
    name: 'The Hunter\'s Path',
    description: 'Become the master of precision and stealth',
    steps: [
      {
        step: 1,
        title: 'First Kill',
        description: 'Prove your archery skills in combat',
        objective: 'Win 5 battles',
        requirement: { type: 'win_battles', target: 5 },
        reward: { gold: 200, exp: 100 }
      },
      {
        step: 2,
        title: 'Craft Your Bow',
        description: 'Create the perfect weapon for a hunter',
        objective: 'Craft a longbow',
        requirement: { type: 'craft_item', target: 1, specificTarget: 'longbow' },
        reward: { gold: 300, exp: 150 }
      },
      {
        step: 3,
        title: 'Trial of Precision',
        description: 'Take down a powerful target',
        objective: 'Defeat a boss',
        requirement: { type: 'defeat_boss', target: 1 },
        reward: { gold: 500, exp: 300 }
      },
      {
        step: 4,
        title: 'Marksman Challenge',
        description: 'Prove your accuracy against skilled opponents',
        objective: 'Win 10 PvP matches',
        requirement: { type: 'pvp_wins', target: 10 },
        reward: { gold: 800, exp: 500 }
      },
      {
        step: 5,
        title: 'Master Hunter',
        description: 'Reach the peak of your hunting prowess',
        objective: 'Reach level 30',
        requirement: { type: 'reach_level', target: 30 },
        reward: { gold: 1500, exp: 1000 }
      },
      {
        step: 6,
        title: 'Legendary Gear',
        description: 'Equip yourself with legendary equipment',
        objective: 'Equip a legendary item',
        requirement: { type: 'equip_item', target: 1, specificTarget: 'legendary' },
        reward: { gold: 2000, exp: 1500 }
      },
      {
        step: 7,
        title: 'Perfect Shots',
        description: 'Never miss your target',
        objective: 'Win 5 PvP matches in a row',
        requirement: { type: 'pvp_wins', target: 5 },
        reward: { gold: 3000, exp: 2000 }
      },
      {
        step: 8,
        title: 'Beast Master',
        description: 'Hunt down the mightiest creatures',
        objective: 'Defeat 5 bosses',
        requirement: { type: 'defeat_boss', target: 5 },
        reward: { gold: 4000, exp: 3000 }
      },
      {
        step: 9,
        title: 'Elite Ranger',
        description: 'Become one of the elite hunters',
        objective: 'Reach level 50',
        requirement: { type: 'reach_level', target: 50 },
        reward: { gold: 6000, exp: 5000 }
      },
      {
        step: 10,
        title: 'Become Legend',
        description: 'Achieve perfection and never miss',
        objective: 'Win 10 PvP matches in a row',
        requirement: { type: 'pvp_wins', target: 10 },
        reward: { gold: 10000, title: 'The Deadeye' }
      }
    ],
    finalReward: {
      gold: 10000,
      item: 'legendary_hunters_bow',
      title: 'The Deadeye',
      cosmetic: 'archer_legend_aura'
    }
  }
};

export async function getStoryQuestProgress(userId: string, characterClass: CharacterClass) {
  try {
    const questChain = STORY_QUEST_CHAINS[characterClass];
    
    const { data, error } = await supabase
      .from('story_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_chain', questChain.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching story quest:', error);
      return null;
    }

    if (!data) {
      // Create new story quest
      const { data: newQuest, error: insertError } = await supabase
        .from('story_quests')
        .insert([{
          user_id: userId,
          quest_chain: questChain.id,
          current_step: 1,
          completed: false,
          progress: {}
        }])
        .select()
        .single();

      return newQuest;
    }

    return data;
  } catch (error) {
    console.error('Error in getStoryQuestProgress:', error);
    return null;
  }
}

export async function updateStoryQuestProgress(
  userId: string,
  questChain: string,
  progress: any,
  currentStep?: number
) {
  try {
    const updateData: any = { progress, updated_at: new Date().toISOString() };
    if (currentStep) updateData.current_step = currentStep;

    const { error } = await supabase
      .from('story_quests')
      .update(updateData)
      .eq('user_id', userId)
      .eq('quest_chain', questChain);

    return !error;
  } catch (error) {
    console.error('Error updating story quest:', error);
    return false;
  }
}

export async function completeStoryQuest(userId: string, questChain: string) {
  try {
    const { error } = await supabase
      .from('story_quests')
      .update({ completed: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('quest_chain', questChain);

    return !error;
  } catch (error) {
    console.error('Error completing story quest:', error);
    return false;
  }
}
