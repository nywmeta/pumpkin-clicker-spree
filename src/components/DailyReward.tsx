import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Flame, Calendar } from "lucide-react";

interface DailyRewardProps {
  isOpen: boolean;
  onClose: () => void;
  canClaim: boolean;
  currentStreak: number;
  longestStreak: number;
  totalClaims: number;
  onClaim: () => void;
  currentReward: { day: number; currency: number; premium: number };
  allRewards: Array<{ day: number; currency: number; premium: number }>;
}

export const DailyReward = ({
  isOpen,
  onClose,
  canClaim,
  currentStreak,
  longestStreak,
  totalClaims,
  onClaim,
  currentReward,
  allRewards,
}: DailyRewardProps) => {
  const nextRewardDay = ((currentStreak) % 7) + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Daily Rewards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                <Flame className="w-5 h-5 text-orange-500" />
                {currentStreak}
              </div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold mb-1">{longestStreak}</div>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                <Calendar className="w-5 h-5" />
                {totalClaims}
              </div>
              <p className="text-xs text-muted-foreground">Total Claims</p>
            </div>
          </div>

          {/* Current Reward */}
          {canClaim && (
            <div className="p-6 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary">
              <div className="text-center space-y-4">
                <div>
                  <Badge className="mb-2">Day {nextRewardDay}</Badge>
                  <h3 className="text-2xl font-bold">Today's Reward</h3>
                </div>
                
                <div className="flex items-center justify-center gap-8 text-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🪙</span>
                    <span className="font-bold">{currentReward.currency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">💎</span>
                    <span className="font-bold">{currentReward.premium}</span>
                  </div>
                </div>
                
                <Button size="lg" onClick={onClaim} className="w-full">
                  Claim Daily Reward
                </Button>
              </div>
            </div>
          )}

          {!canClaim && (
            <div className="p-6 rounded-lg bg-muted text-center">
              <p className="text-muted-foreground">
                Come back tomorrow to claim your next reward!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Current streak: {currentStreak} days 🔥
              </p>
            </div>
          )}

          {/* Weekly Rewards Preview */}
          <div className="space-y-3">
            <h4 className="font-semibold">Weekly Reward Cycle</h4>
            <div className="grid grid-cols-7 gap-2">
              {allRewards.map((reward) => {
                const isCurrentDay = reward.day === nextRewardDay && canClaim;
                const isPastDay = currentStreak > 0 && reward.day < nextRewardDay;
                
                return (
                  <div
                    key={reward.day}
                    className={`p-3 rounded-lg text-center border-2 ${
                      isCurrentDay
                        ? 'border-primary bg-primary/10'
                        : isPastDay
                        ? 'border-muted bg-muted/50 opacity-60'
                        : 'border-border'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-2">Day {reward.day}</div>
                    <div className="space-y-1 text-xs">
                      <div>🪙 {reward.currency}</div>
                      <div>💎 {reward.premium}</div>
                    </div>
                    {reward.day === 7 && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Bonus!
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Log in daily to maintain your streak and earn better rewards! Missing a day resets your streak.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
