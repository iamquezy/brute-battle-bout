import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sword, Shield, Sparkles, Package } from 'lucide-react';
import { Character } from '@/types/game';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type CombatAction = 'attack' | 'defend' | 'skill' | 'item';

interface CombatActionButtonsProps {
  player: Character;
  onAction: (action: CombatAction) => void;
  disabled?: boolean;
  isDefending?: boolean;
}

export const CombatActionButtons = ({ 
  player, 
  onAction, 
  disabled = false,
  isDefending = false 
}: CombatActionButtonsProps) => {
  return (
    <Card className="p-4 bg-background/95 backdrop-blur border-2 border-primary/50">
      <div className="text-center mb-3">
        <h3 className="text-lg font-bold text-primary">Your Turn!</h3>
        <p className="text-sm text-muted-foreground">Choose your action</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onAction('attack')}
                disabled={disabled}
                size="lg"
                className="h-20 flex flex-col gap-1 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                <Sword className="w-6 h-6" />
                <span className="font-bold">ATTACK</span>
                <span className="text-xs opacity-80">[A]</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Launch a timed attack for bonus damage</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onAction('defend')}
                disabled={disabled || isDefending}
                size="lg"
                className="h-20 flex flex-col gap-1 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Shield className="w-6 h-6" />
                <span className="font-bold">DEFEND</span>
                <span className="text-xs opacity-80">[D]</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reduce incoming damage by 50% this turn</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onAction('skill')}
                disabled={disabled}
                size="lg"
                className="h-20 flex flex-col gap-1 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Sparkles className="w-6 h-6" />
                <span className="font-bold">SKILL</span>
                <span className="text-xs opacity-80">[S]</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use a powerful class ability</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onAction('item')}
                disabled={disabled}
                size="lg"
                className="h-20 flex flex-col gap-1 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Package className="w-6 h-6" />
                <span className="font-bold">ITEM</span>
                <span className="text-xs opacity-80">[I]</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use a consumable item (Coming Soon)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};
