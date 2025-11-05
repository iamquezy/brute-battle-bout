import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Star } from 'lucide-react';

interface AchievementNotificationProps {
  show: boolean;
  title: string;
  description: string;
  onComplete: () => void;
}

export const AchievementNotification = ({ 
  show, 
  title, 
  description, 
  onComplete 
}: AchievementNotificationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-2xl min-w-[300px] animate-in slide-in-from-right">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-full">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <p className="text-xs font-semibold text-yellow-500">Achievement Unlocked!</p>
            </div>
            <p className="font-bold mb-1">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};