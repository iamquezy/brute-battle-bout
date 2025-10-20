import { CharacterClass } from './game';

export type SkillTreeBranch = 'offense' | 'defense' | 'utility';

export interface SkillTreeNode {
  id: string;
  name: string;
  description: string;
  branch: SkillTreeBranch;
  cost: number; // skill points
  prerequisite: string | null; // parent node id
  effect: {
    attack?: number;
    defense?: number;
    speed?: number;
    health?: number;
    evasion?: number;
    critChance?: number;
    luck?: number;
    special?: string; // special ability description
  };
  unlocked: boolean;
  row: number; // for visual layout (0-4)
  column: number; // for visual layout (0-2, representing branches)
}

export interface SkillTree {
  class: CharacterClass;
  nodes: SkillTreeNode[];
}
