import { Character } from '@/types/game';
import { Equipment, EquipmentSlots } from '@/types/equipment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Swords, Users, Trophy, Settings, Backpack, 
  Heart, Shield, Zap, Sword, Crown, Star,
  Target, Sparkles, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

import warriorAvatar from '@/assets/avatars/warrior.png';
import mageAvatar from '@/assets/avatars/mage.png';
import archerAvatar from '@/assets/avatars/archer.png';

interface GameHubProps {
  player: Character;
  equippedItems: EquipmentSlots;
  battleHistory: { result: 'victory' | 'defeat' }[];
  winStreak: number;
  skillPoints: number;
  onStartBattle: () => void;
  onOpenPvP: () => void;
  onOpenGuild: () => void;
  onOpenInventory: () => void;
  onOpenSkills: () => void;
  onOpenShop: () => void;
  onOpenQuests: () => void;
  onOpenBosses: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export function GameHub({
  player,
  equippedItems,
  battleHistory,
  winStreak,
  skillPoints,
  onStartBattle,
  onOpenPvP,
  onOpenGuild,
  onOpenInventory,
  onOpenSkills,
  onOpenShop,
  onOpenQuests,
  onOpenBosses,
  onOpenSettings,
  onSignOut,
}: GameHubProps) {
  const wins = battleHistory.filter(b => b.result === 'victory').length;
  const losses = battleHistory.filter(b => b.result === 'defeat').length;
  const expNeeded = player.level * 100;
  const expProgress = (player.experience / expNeeded) * 100;

  const getAvatarForClass = (characterClass: string) => {
    switch (characterClass) {
      case 'fighter': return warriorAvatar;
      case 'mage': return mageAvatar;
      case 'archer': return archerAvatar;
      default: return warriorAvatar;
    }
  };

  const getClassGradient = (characterClass: string) => {
    switch (characterClass) {
      case 'fighter': return 'from-fighter/30 via-fighter/10 to-transparent';
      case 'mage': return 'from-mage/30 via-mage/10 to-transparent';
      case 'archer': return 'from-archer/30 via-archer/10 to-transparent';
      default: return 'from-primary/30 via-primary/10 to-transparent';
    }
  };

  const getClassBorder = (characterClass: string) => {
    switch (characterClass) {
      case 'fighter': return 'border-fighter/50';
      case 'mage': return 'border-mage/50';
      case 'archer': return 'border-archer/50';
      default: return 'border-primary/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-arena">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Arena Legends</h1>
              <p className="text-xs text-muted-foreground">Season 1</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{player.gold.toLocaleString()}</span>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onOpenSettings}>
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Character Card - Hero Section */}
        <Card className={cn(
          "overflow-hidden bg-gradient-to-r border-2",
          getClassGradient(player.class),
          getClassBorder(player.class)
        )}>
          <div className="p-6 flex flex-col md:flex-row gap-6">
            {/* Character Avatar */}
            <div className="flex-shrink-0">
              <div className={cn(
                "w-32 h-32 rounded-2xl overflow-hidden border-4 shadow-lg",
                getClassBorder(player.class)
              )}>
                <img 
                  src={getAvatarForClass(player.class)} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Character Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold">{player.name}</h2>
                  <Badge variant="outline" className="capitalize">
                    {player.class}
                  </Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Lv. {player.level}
                  </Badge>
                </div>
                
                {/* Win/Loss Record */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="text-success">{wins} Wins</span>
                  <span className="text-destructive">{losses} Losses</span>
                  {winStreak > 0 && (
                    <span className="text-primary flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {winStreak} Win Streak
                    </span>
                  )}
                </div>
              </div>
              
              {/* Experience Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="text-foreground">{player.experience} / {expNeeded}</span>
                </div>
                <Progress value={expProgress} className="h-2" />
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBadge icon={Heart} label="Health" value={player.stats.health} color="text-destructive" />
                <StatBadge icon={Sword} label="Attack" value={player.stats.attack} color="text-primary" />
                <StatBadge icon={Shield} label="Defense" value={player.stats.defense} color="text-accent" />
                <StatBadge icon={Zap} label="Speed" value={player.stats.speed} color="text-success" />
              </div>
            </div>
          </div>
        </Card>

        {/* Main Action - Battle Button */}
        <Button 
          onClick={onStartBattle}
          className="w-full h-16 text-xl font-bold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg"
        >
          <Swords className="w-6 h-6 mr-3" />
          Enter Arena
        </Button>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionCard 
            icon={Trophy} 
            label="PvP Arena" 
            description="Battle players"
            onClick={onOpenPvP}
          />
          <ActionCard 
            icon={Users} 
            label="Guild" 
            description="Join forces"
            onClick={onOpenGuild}
          />
          <ActionCard 
            icon={Target} 
            label="Bosses" 
            description="Raid battles"
            onClick={onOpenBosses}
          />
          <ActionCard 
            icon={Sparkles} 
            label="Quests" 
            description="Earn rewards"
            onClick={onOpenQuests}
          />
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            onClick={onOpenInventory}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Backpack className="w-4 h-4" />
            Inventory
          </Button>
          <Button 
            variant="outline" 
            onClick={onOpenSkills}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Skills
            {skillPoints > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-xs px-1.5">
                {skillPoints}
              </Badge>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onOpenShop}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            Shop
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatBadge({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border/50">
      <Icon className={cn("w-4 h-4", color)} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold text-sm">{value}</p>
      </div>
    </div>
  );
}

function ActionCard({ 
  icon: Icon, 
  label, 
  description, 
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  description: string;
  onClick: () => void;
}) {
  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors group"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
