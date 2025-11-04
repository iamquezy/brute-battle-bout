import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CombatSkill } from '@/hooks/useCombatSkills';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillSelectionModalProps {
  open: boolean;
  skills: CombatSkill[];
  cooldowns: Record<string, number>;
  onSelect: (skill: CombatSkill) => void;
  onClose: () => void;
}

export const SkillSelectionModal = ({
  open,
  skills,
  cooldowns,
  onSelect,
  onClose
}: SkillSelectionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Skill</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {skills.map((skill) => {
            const isOnCooldown = cooldowns[skill.id] && cooldowns[skill.id] > 0;
            const cooldownTurns = cooldowns[skill.id] || 0;

            return (
              <Card
                key={skill.id}
                className={cn(
                  "p-4 transition-all cursor-pointer",
                  isOnCooldown 
                    ? "opacity-50 cursor-not-allowed bg-secondary/50" 
                    : "hover:bg-primary/10 hover:border-primary"
                )}
                onClick={() => !isOnCooldown && onSelect(skill)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold">{skill.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {skill.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Cooldown: {skill.cooldown} turns</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isOnCooldown ? (
                      <div className="px-3 py-2 bg-secondary rounded-lg">
                        <div className="text-sm font-bold text-muted-foreground">
                          {cooldownTurns}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          turns
                        </div>
                      </div>
                    ) : (
                      <Button variant="default" size="sm">
                        Use Skill
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};
