import { Character } from '@/types/game';
import { Equipment, EquipmentSlots } from '@/types/equipment';
import { Pet } from '@/types/pets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Swords, Users, Trophy, Backpack, 
  Heart, Shield, Zap, Sword, Crown, Star,
  Target, Sparkles, LogOut, ChevronRight,
  Flame, Skull, Package, Hammer, TreePine,
  Globe, Store, Award, Settings, Dumbbell,
  Eye, ArrowRightLeft, Castle, Map
} from 'lucide-react';
import { cn } from '@/lib/utils';

import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';

interface GameHubProps {
  player: Character;
  equippedItems: EquipmentSlots;
  activePet: Pet | null;
  battleHistory: { result: 'victory' | 'defeat'; opponent?: string }[];
  winStreak: number;
  skillPoints: number;
  dailyFightsUsed: number;
  maxDailyFights: number;
  onStartBattle: () => void;
  onOpenPvP: () => void;
  onOpenGuild: () => void;
  onOpenBosses: () => void;
  onOpenInventory: () => void;
  onOpenSkills: () => void;
  onOpenShop: () => void;
  onOpenQuests: () => void;
  onOpenAchievements: () => void;
  onOpenPets: () => void;
  onOpenCrafting: () => void;
  onOpenTraining: () => void;
  onOpenDungeon: () => void;
  onOpenTrading: () => void;
  onOpenCosmetics: () => void;
  onOpenHallOfFame: () => void;
  onOpenWorldBoss: () => void;
  onOpenEvents: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export function GameHub({
  player,
  equippedItems,
  activePet,
  battleHistory,
  winStreak,
  skillPoints,
  dailyFightsUsed,
  maxDailyFights,
  onStartBattle,
  onOpenPvP,
  onOpenGuild,
  onOpenBosses,
  onOpenInventory,
  onOpenSkills,
  onOpenShop,
  onOpenQuests,
  onOpenAchievements,
  onOpenPets,
  onOpenCrafting,
  onOpenTraining,
  onOpenDungeon,
  onOpenTrading,
  onOpenCosmetics,
  onOpenHallOfFame,
  onOpenWorldBoss,
  onOpenEvents,
  onOpenSettings,
  onSignOut,
}: GameHubProps) {
  const wins = battleHistory.filter(b => b.result === 'victory').length;
  const losses = battleHistory.filter(b => b.result === 'defeat').length;
  const expNeeded = player.level * 100;
  const expProgress = (player.experience / expNeeded) * 100;
  const fightsRemaining = maxDailyFights - dailyFightsUsed;

  const getAvatarForClass = (characterClass: string) => {
    switch (characterClass) {
      case 'fighter': return warriorAvatar;
      case 'mage': return mageAvatar;
      case 'archer': return archerAvatar;
      default: return warriorAvatar;
    }
  };

  const getClassAccent = (characterClass: string) => {
    switch (characterClass) {
      case 'fighter': return 'border-fighter';
      case 'mage': return 'border-mage';
      case 'archer': return 'border-archer';
      default: return 'border-primary';
    }
  };

  const recentBattles = battleHistory.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-arena">
      {/* Top Bar */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">Arena Legends</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm">
              <Star className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold text-primary">{player.gold.toLocaleString()}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Character Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Avatar & Identity */}
          <Card className={cn(
            "p-5 border-2 bg-card/80 backdrop-blur-sm",
            getClassAccent(player.class)
          )}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className={cn(
                "w-28 h-28 rounded-xl overflow-hidden border-3 shadow-lg ring-2 ring-offset-2 ring-offset-background",
                player.class === 'fighter' ? 'ring-fighter' :
                player.class === 'mage' ? 'ring-mage' : 'ring-archer'
              )}>
                <img 
                  src={getAvatarForClass(player.class)} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{player.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize text-xs">
                    {player.class}
                  </Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    Lv. {player.level}
                  </Badge>
                </div>
              </div>

              {/* W/L Record */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-success font-medium">{wins}W</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-destructive font-medium">{losses}L</span>
                {winStreak > 0 && (
                  <span className="text-primary flex items-center gap-0.5">
                    <Flame className="w-3 h-3" /> {winStreak}
                  </span>
                )}
              </div>

              {/* XP Bar */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>EXP</span>
                  <span>{player.experience}/{expNeeded}</span>
                </div>
                <Progress value={expProgress} className="h-1.5" />
              </div>

              {/* Active Pet */}
              {activePet && (
                <div className="flex items-center gap-2 text-xs bg-secondary/50 rounded-lg px-3 py-1.5 w-full">
                  <span className="text-lg">{activePet.emoji}</span>
                  <span className="text-muted-foreground">{activePet.name} Lv.{activePet.level}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Middle: Stats & Equipment */}
          <Card className="p-5 bg-card/80 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <StatRow icon={Heart} label="HP" value={`${player.stats.health}/${player.stats.maxHealth}`} color="text-destructive" />
              <StatRow icon={Sword} label="ATK" value={player.stats.attack} color="text-primary" />
              <StatRow icon={Shield} label="DEF" value={player.stats.defense} color="text-accent" />
              <StatRow icon={Zap} label="SPD" value={player.stats.speed} color="text-success" />
              <StatRow icon={Eye} label="EVA" value={`${player.stats.evasion}%`} color="text-muted-foreground" />
              <StatRow icon={Target} label="CRIT" value={`${player.stats.critChance}%`} color="text-primary" />
            </div>

            <Separator className="my-3" />

            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Backpack className="w-4 h-4" /> Equipment
            </h3>
            <div className="space-y-1.5">
              <EquipSlot label="Weapon" item={equippedItems.weapon} />
              <EquipSlot label="Armor" item={equippedItems.armor} />
              <EquipSlot label="Accessory" item={equippedItems.accessory} />
            </div>
          </Card>

          {/* Right: Battle & Recent Activity */}
          <div className="space-y-4">
            {/* Big Fight Button */}
            <Card className="p-5 bg-card/80 backdrop-blur-sm space-y-3">
              <Button 
                onClick={onStartBattle}
                disabled={fightsRemaining <= 0}
                className="w-full h-14 text-lg font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg"
              >
                <Swords className="w-5 h-5 mr-2" />
                Fight!
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {fightsRemaining} / {maxDailyFights} fights today
              </p>
            </Card>

            {/* Recent Battles */}
            <Card className="p-4 bg-card/80 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Recent Battles</h3>
              {recentBattles.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">No battles yet. Fight!</p>
              ) : (
                <div className="space-y-1">
                  {recentBattles.map((b, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between text-xs px-2 py-1.5 rounded",
                      b.result === 'victory' ? 'bg-success/10' : 'bg-destructive/10'
                    )}>
                      <span className="truncate">{b.opponent || 'Enemy'}</span>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5",
                        b.result === 'victory' ? 'text-success border-success/30' : 'text-destructive border-destructive/30'
                      )}>
                        {b.result === 'victory' ? 'WIN' : 'LOSS'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard icon={Trophy} label="PvP Arena" desc="Fight players" onClick={onOpenPvP} accent="text-primary" />
          <ActionCard icon={Users} label="Guild" desc="Join forces" onClick={onOpenGuild} accent="text-accent" />
          <ActionCard icon={Skull} label="Bosses" desc="Epic battles" onClick={onOpenBosses} accent="text-destructive" />
          <ActionCard icon={Map} label="Dungeons" desc="Explore & loot" onClick={onOpenDungeon} accent="text-success" />
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <SmallAction icon={Backpack} label="Inventory" onClick={onOpenInventory} badge={undefined} />
          <SmallAction icon={Sparkles} label="Skills" onClick={onOpenSkills} badge={skillPoints > 0 ? skillPoints : undefined} />
          <SmallAction icon={Store} label="Shop" onClick={onOpenShop} badge={undefined} />
          <SmallAction icon={Target} label="Quests" onClick={onOpenQuests} badge={undefined} />
          <SmallAction icon={Hammer} label="Crafting" onClick={onOpenCrafting} badge={undefined} />
          <SmallAction icon={Dumbbell} label="Training" onClick={onOpenTraining} badge={undefined} />
        </div>

        {/* Tertiary Features */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <SmallAction icon={Heart} label="Pets" onClick={onOpenPets} badge={undefined} />
          <SmallAction icon={Award} label="Achievements" onClick={onOpenAchievements} badge={undefined} />
          <SmallAction icon={ArrowRightLeft} label="Trading" onClick={onOpenTrading} badge={undefined} />
          <SmallAction icon={Globe} label="World Boss" onClick={onOpenWorldBoss} badge={undefined} />
          <SmallAction icon={Flame} label="Events" onClick={onOpenEvents} badge={undefined} />
          <SmallAction icon={Crown} label="Hall of Fame" onClick={onOpenHallOfFame} badge={undefined} />
        </div>
      </main>
    </div>
  );
}

function StatRow({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={cn("w-3.5 h-3.5", color)} />
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="ml-auto font-bold text-xs">{value}</span>
    </div>
  );
}

function EquipSlot({ label, item }: { label: string; item: Equipment | null }) {
  return (
    <div className="flex items-center gap-2 text-xs px-2 py-1.5 rounded bg-secondary/30">
      <span className="text-muted-foreground w-16">{label}</span>
      {item ? (
        <span className={cn(
          "font-medium truncate",
          item.rarity === 'legendary' ? 'text-rarity-legendary' :
          item.rarity === 'epic' ? 'text-rarity-epic' :
          item.rarity === 'rare' ? 'text-rarity-rare' :
          item.rarity === 'uncommon' ? 'text-rarity-uncommon' :
          'text-rarity-common'
        )}>
          {item.name} {item.enhancementLevel ? `+${item.enhancementLevel}` : ''}
        </span>
      ) : (
        <span className="text-muted-foreground/50 italic">Empty</span>
      )}
    </div>
  );
}

function ActionCard({ icon: Icon, label, desc, onClick, accent }: {
  icon: React.ElementType; label: string; desc: string; onClick: () => void; accent: string;
}) {
  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-secondary/50 transition-all hover:scale-[1.02] group border-border/50"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center group-hover:bg-secondary transition-colors">
          <Icon className={cn("w-5 h-5", accent)} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </Card>
  );
}

function SmallAction({ icon: Icon, label, onClick, badge }: {
  icon: React.ElementType; label: string; onClick: () => void; badge: number | undefined;
}) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="h-auto py-3 px-2 flex flex-col items-center gap-1.5 relative text-xs border-border/40 hover:bg-secondary/50"
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-[11px]">{label}</span>
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Button>
  );
}
