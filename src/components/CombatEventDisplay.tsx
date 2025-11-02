import { useEffect, useState } from 'react';
import { CombatEvent } from '@/lib/gameLogic';
import { AlertCircle, Sparkles, Flame, Heart, Zap } from 'lucide-react';

interface CombatEventDisplayProps {
  event: CombatEvent;
  onComplete?: () => void;
}

const EVENT_CONFIG = {
  critical_failure: {
    icon: AlertCircle,
    text: 'CRITICAL FAILURE!',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    description: 'Attack missed completely!'
  },
  pet_interference: {
    icon: Sparkles,
    text: 'PET INTERFERENCE!',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
    description: 'Your pet joined the attack!'
  },
  arena_hazard: {
    icon: Flame,
    text: 'ARENA HAZARD!',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    description: 'Arena hazard damages both fighters!'
  },
  second_wind: {
    icon: Heart,
    text: 'SECOND WIND!',
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'Recovered some health!'
  },
  divine_blessing: {
    icon: Zap,
    text: 'DIVINE BLESSING!',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    description: 'Next attack guaranteed critical!'
  },
};

export const CombatEventDisplay = ({ event, onComplete }: CombatEventDisplayProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!event) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [event, onComplete]);

  if (!event || !visible) return null;

  const config = EVENT_CONFIG[event];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`${config.bgColor} ${config.color} p-6 rounded-lg border-2 border-current animate-in zoom-in-50 duration-300`}>
        <div className="flex items-center gap-4">
          <Icon className="w-12 h-12 animate-pulse" />
          <div>
            <div className="text-2xl font-bold">{config.text}</div>
            <div className="text-sm opacity-90">{config.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
