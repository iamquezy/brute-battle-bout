export interface EnhancementCost {
  gold: number;
  materials?: {
    common_shard?: number;
    uncommon_shard?: number;
    rare_shard?: number;
    epic_shard?: number;
    legendary_shard?: number;
  };
}

export interface EnhancementResult {
  success: boolean;
  newLevel: number;
  destroyed?: boolean;
  message: string;
}

export const MAX_ENHANCEMENT_LEVEL = 10;

export const ENHANCEMENT_SUCCESS_RATES: Record<number, number> = {
  0: 100,  // +0 to +1
  1: 100,  // +1 to +2
  2: 100,  // +2 to +3
  3: 90,   // +3 to +4
  4: 80,   // +4 to +5
  5: 70,   // +5 to +6
  6: 60,   // +6 to +7
  7: 40,   // +7 to +8
  8: 30,   // +8 to +9
  9: 20,   // +9 to +10
};

export const ENHANCEMENT_COSTS: Record<number, EnhancementCost> = {
  0: { gold: 100 },
  1: { gold: 200 },
  2: { gold: 400, materials: { common_shard: 3 } },
  3: { gold: 800, materials: { uncommon_shard: 3 } },
  4: { gold: 1500, materials: { uncommon_shard: 5 } },
  5: { gold: 3000, materials: { rare_shard: 3 } },
  6: { gold: 6000, materials: { rare_shard: 5 } },
  7: { gold: 12000, materials: { epic_shard: 3 } },
  8: { gold: 25000, materials: { epic_shard: 5 } },
  9: { gold: 50000, materials: { legendary_shard: 3 } },
};

export const ENHANCEMENT_STAT_BONUS = 0.1; // +10% per enhancement level