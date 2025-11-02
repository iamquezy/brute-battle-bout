import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Coins, Sparkles, Trophy } from 'lucide-react';
import { DailyReward } from '@/lib/dailyRewards';

interface DailyRewardModalProps {
  open: boolean;
  onClose: () => void;
  reward: DailyReward;
  loginStreak: number;
}

export const DailyRewardModal = ({ open, onClose, reward, loginStreak }: DailyRewardModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Gift className="text-primary" size={32} />
            Daily Reward!
          </DialogTitle>
          <DialogDescription className="text-center text-foreground">
            Day {reward.day} of your login streak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border-2 border-primary/20">
              <Trophy className="text-primary" size={24} />
              <span className="text-2xl font-bold text-foreground">
                {loginStreak} Day Streak
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 border-2 border-primary/20">
            <p className="text-center text-sm text-muted-foreground mb-4">You received:</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 text-lg">
                <Coins className="text-yellow-400" size={28} />
                <span className="font-bold text-foreground">{reward.gold} Gold</span>
              </div>

              {reward.item && (
                <div className="flex items-center justify-center gap-3 text-lg">
                  <Sparkles className="text-primary" size={28} />
                  <span className="font-bold text-foreground">
                    {reward.item === 'health_potion' && 'Health Potion'}
                    {reward.item === 'exp_boost' && 'XP Boost'}
                    {reward.item === 'skill_token' && 'Skill Token'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Come back tomorrow to continue your streak!
          </div>
        </div>

        <Button onClick={onClose} className="w-full" size="lg">
          Claim Reward
        </Button>
      </DialogContent>
    </Dialog>
  );
};
