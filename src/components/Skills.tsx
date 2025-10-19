import { Card } from '@/components/ui/card';
import { ALL_SKILLS } from '@/lib/skillsData';
import { Zap, Shield, Flame, Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillsProps {
  acquiredSkills: string[];
}

const CATEGORY_ICONS: Record<string, any> = {
  passive: Shield,
  stat_booster: Star,
  super: Flame,
  talent: Zap,
};

export function Skills({ acquiredSkills }: SkillsProps) {
  const skills = ALL_SKILLS.map(skill => ({
    ...skill,
    acquired: acquiredSkills.includes(skill.id),
  }));

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-combat">
      <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Skills ({acquiredSkills.length}/{ALL_SKILLS.length})
      </h2>
      
      <div className="grid grid-cols-7 gap-2">
        {skills.map((skill) => {
          const Icon = CATEGORY_ICONS[skill.category];
          const rarityColor = 
            skill.rarity === 'legendary' ? 'border-[hsl(var(--rarity-legendary))] bg-[hsl(var(--rarity-legendary))]/10' :
            skill.rarity === 'epic' ? 'border-[hsl(var(--rarity-epic))] bg-[hsl(var(--rarity-epic))]/10' :
            skill.rarity === 'rare' ? 'border-[hsl(var(--rarity-rare))] bg-[hsl(var(--rarity-rare))]/10' :
            skill.rarity === 'uncommon' ? 'border-[hsl(var(--rarity-uncommon))] bg-[hsl(var(--rarity-uncommon))]/10' :
            'border-[hsl(var(--rarity-common))] bg-[hsl(var(--rarity-common))]/10';

          return (
            <TooltipProvider key={skill.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      relative aspect-square rounded border-2 flex items-center justify-center
                      ${skill.acquired ? rarityColor : 'border-muted bg-muted/20 opacity-30'}
                      transition-all hover:scale-110 cursor-pointer
                    `}
                  >
                    <Icon className={`w-5 h-5 ${skill.acquired ? 'text-foreground' : 'text-muted-foreground'}`} />
                    {skill.acquired && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border border-background" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{skill.name}</p>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {skill.category.replace('_', ' ')} • {skill.rarity}
                    </p>
                    {skill.effect && (
                      <div className="text-xs space-y-0.5 pt-1 border-t border-border">
                        {skill.effect.attack && <p>+{skill.effect.attack} Attack</p>}
                        {skill.effect.defense && <p>+{skill.effect.defense} Defense</p>}
                        {skill.effect.speed && <p>+{skill.effect.speed} Speed</p>}
                        {skill.effect.health && <p>+{skill.effect.health} Health</p>}
                        {skill.effect.evasion && <p>+{skill.effect.evasion}% Evasion</p>}
                        {skill.effect.critChance && <p>+{skill.effect.critChance}% Crit</p>}
                        {skill.effect.luck && <p>+{skill.effect.luck} Luck</p>}
                      </div>
                    )}
                    {skill.usesPerFight && (
                      <p className="text-xs text-primary pt-1">
                        Uses: {skill.usesPerFight} per fight
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </Card>
  );
}
