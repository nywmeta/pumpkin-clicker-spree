import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Gem, Wrench, Lock, CheckCircle2, Crown } from "lucide-react";

interface BattlePassProps {
  open: boolean;
  onClose: () => void;
  activeSeason: any;
  tiers: any[];
  userProgress: any;
  onClaimReward: (tierNumber: number, isPremium: boolean) => void;
  onPurchasePremium: () => void;
}

export const BattlePass = ({
  open,
  onClose,
  activeSeason,
  tiers,
  userProgress,
  onClaimReward,
  onPurchasePremium
}: BattlePassProps) => {
  if (!activeSeason || !userProgress) return null;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'currency': return <Coins className="w-4 h-4" />;
      case 'premium_currency': return <Gem className="w-4 h-4" />;
      case 'material': return <Wrench className="w-4 h-4" />;
      case 'cosmetic': return <Crown className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRewardText = (type: string, amount: number | null, cosmetic: string | null) => {
    if (type === 'cosmetic' && cosmetic) return cosmetic;
    if (amount) return `${amount}x`;
    return '';
  };

  const isRewardClaimed = (tierNumber: number, isPremium: boolean) => {
    return isPremium
      ? userProgress.claimed_premium_tiers?.includes(tierNumber)
      : userProgress.claimed_free_tiers?.includes(tierNumber);
  };

  const canClaimReward = (tierNumber: number) => {
    return tierNumber <= userProgress.current_tier;
  };

  const nextTier = tiers.find(t => t.tier_number === userProgress.current_tier + 1);
  const progressToNextTier = nextTier 
    ? ((userProgress.current_xp / nextTier.xp_required) * 100)
    : 100;

  const daysLeft = Math.ceil(
    (new Date(activeSeason.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                {activeSeason.name}
                {userProgress.has_premium && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {activeSeason.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg">Tier {userProgress.current_tier}</div>
              <div className="text-xs text-muted-foreground">{daysLeft} days left</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* XP Progress */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to Tier {userProgress.current_tier + 1}</span>
                <span>{userProgress.current_xp} / {nextTier.xp_required} XP</span>
              </div>
              <Progress value={progressToNextTier} className="h-3" />
            </div>
          )}

          {/* Premium Purchase */}
          {!userProgress.has_premium && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 p-4 rounded-lg border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Upgrade to Premium
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unlock premium rewards for all tiers!
                  </p>
                </div>
                <Button onClick={onPurchasePremium} className="bg-gradient-to-r from-yellow-500 to-amber-600">
                  <Gem className="w-4 h-4 mr-2" />
                  500 Gems
                </Button>
              </div>
            </div>
          )}

          {/* Tiers */}
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {tiers.map((tier) => {
                const isUnlocked = tier.tier_number <= userProgress.current_tier;
                const freeRewardClaimed = isRewardClaimed(tier.tier_number, false);
                const premiumRewardClaimed = isRewardClaimed(tier.tier_number, true);

                return (
                  <div
                    key={tier.id}
                    className={`border rounded-lg p-4 ${
                      isUnlocked ? 'bg-card' : 'bg-muted/50'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Tier Number */}
                      <div className="col-span-1 text-center">
                        <div className={`font-bold ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                          {tier.tier_number}
                        </div>
                      </div>

                      {/* Free Reward */}
                      <div className="col-span-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRewardIcon(tier.free_reward_type)}
                          <span className="text-sm">
                            {getRewardText(tier.free_reward_type, tier.free_reward_amount, tier.free_reward_cosmetic)}
                          </span>
                        </div>
                        {isUnlocked && !freeRewardClaimed && (
                          <Button
                            size="sm"
                            onClick={() => onClaimReward(tier.tier_number, false)}
                          >
                            Claim
                          </Button>
                        )}
                        {freeRewardClaimed && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {!isUnlocked && (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Premium Reward */}
                      <div className={`col-span-6 flex items-center justify-between ${
                        !userProgress.has_premium ? 'opacity-50' : ''
                      }`}>
                        {tier.premium_reward_type && (
                          <>
                            <div className="flex items-center gap-2">
                              {getRewardIcon(tier.premium_reward_type)}
                              <span className="text-sm">
                                {getRewardText(tier.premium_reward_type, tier.premium_reward_amount, tier.premium_reward_cosmetic)}
                              </span>
                              <Crown className="w-3 h-3 text-yellow-500" />
                            </div>
                            {userProgress.has_premium && isUnlocked && !premiumRewardClaimed && (
                              <Button
                                size="sm"
                                onClick={() => onClaimReward(tier.tier_number, true)}
                                className="bg-gradient-to-r from-yellow-500 to-amber-600"
                              >
                                Claim
                              </Button>
                            )}
                            {premiumRewardClaimed && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {(!isUnlocked || !userProgress.has_premium) && (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
