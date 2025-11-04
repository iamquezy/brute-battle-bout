import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TimingBarProps {
  onComplete: (success: boolean, quality: 'perfect' | 'good' | 'normal') => void;
  onCancel: () => void;
}

export const TimingBar = ({ onComplete, onCancel }: TimingBarProps) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [clicked, setClicked] = useState(false);

  // Perfect zone: 45-55, Good zone: 35-65
  const perfectZone = { start: 45, end: 55 };
  const goodZone = { start: 35, end: 65 };

  useEffect(() => {
    if (clicked) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        if (direction === 'forward') {
          if (prev >= 100) {
            setDirection('backward');
            return 100;
          }
          return prev + 2;
        } else {
          if (prev <= 0) {
            setDirection('forward');
            return 0;
          }
          return prev - 2;
        }
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [direction, clicked]);

  const handleClick = useCallback(() => {
    if (clicked) return;
    
    setClicked(true);
    
    if (position >= perfectZone.start && position <= perfectZone.end) {
      onComplete(true, 'perfect');
    } else if (position >= goodZone.start && position <= goodZone.end) {
      onComplete(true, 'good');
    } else {
      onComplete(false, 'normal');
    }
  }, [position, clicked, onComplete, perfectZone, goodZone]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleClick();
      } else if (e.code === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleClick, onCancel]);

  return (
    <Card className="p-6 bg-background/95 backdrop-blur border-2 border-primary/50">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Time Your Attack!</h3>
          <p className="text-sm text-muted-foreground">
            Click when the bar is in the <span className="text-green-500">green zone</span> for bonus damage
          </p>
        </div>

        {/* Timing Bar */}
        <div className="relative h-12 bg-secondary/50 rounded-lg overflow-hidden border-2 border-border">
          {/* Good Zone */}
          <div 
            className="absolute h-full bg-yellow-500/30 border-x-2 border-yellow-500/50"
            style={{
              left: `${goodZone.start}%`,
              width: `${goodZone.end - goodZone.start}%`
            }}
          />
          
          {/* Perfect Zone */}
          <div 
            className="absolute h-full bg-green-500/40 border-x-2 border-green-500"
            style={{
              left: `${perfectZone.start}%`,
              width: `${perfectZone.end - perfectZone.start}%`
            }}
          />

          {/* Moving Indicator */}
          <div 
            className={cn(
              "absolute h-full w-2 bg-primary transition-all duration-75",
              clicked && "animate-pulse"
            )}
            style={{ left: `${position}%` }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClick}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
            disabled={clicked}
          >
            STRIKE! [Space]
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Cancel [Esc]
          </button>
        </div>
      </div>
    </Card>
  );
};
