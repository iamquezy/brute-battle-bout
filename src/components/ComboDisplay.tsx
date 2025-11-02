import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ComboDisplayProps {
  combo: number;
  className?: string;
}

export const ComboDisplay = ({ combo, className }: ComboDisplayProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (combo > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  if (combo < 2) return null;

  const multiplier = Math.min(1 + (combo * 0.2), 3).toFixed(1);
  
  const getComboColor = () => {
    if (combo >= 10) return 'text-[hsl(var(--rarity-legendary))]';
    if (combo >= 7) return 'text-[hsl(var(--rarity-epic))]';
    if (combo >= 4) return 'text-[hsl(var(--rarity-rare))]';
    return 'text-primary';
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div 
        className={cn(
          'text-6xl font-bold transition-all duration-300',
          getComboColor(),
          isAnimating && 'scale-125'
        )}
      >
        {combo}x
      </div>
      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Combo!
      </div>
      <div className="text-xs text-muted-foreground">
        {multiplier}x Damage
      </div>
      {combo >= 5 && (
        <div className="text-xs font-bold text-primary animate-pulse">
          🔥 ON FIRE 🔥
        </div>
      )}
      {combo >= 10 && (
        <div className="text-xs font-bold text-[hsl(var(--rarity-legendary))] animate-bounce">
          ⚡ UNSTOPPABLE ⚡
        </div>
      )}
    </div>
  );
};
