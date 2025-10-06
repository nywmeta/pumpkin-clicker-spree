import { ShoppingBag, Package, Settings, Trophy, Gift, Sparkles, Award, Calendar, Users, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  onInventoryClick: () => void;
  onShopClick: () => void;
  onSettingsClick: () => void;
  onLeaderboardClick: () => void;
  onLootboxClick: () => void;
  onCosmeticClick: () => void;
  onAchievementsClick: () => void;
  onDailyRewardClick: () => void;
  onSocialClick: () => void;
  onBattlePassClick: () => void;
  onChallengesClick: () => void;
}

export const MobileNav = ({
  onInventoryClick,
  onShopClick,
  onSettingsClick,
  onLeaderboardClick,
  onLootboxClick,
  onCosmeticClick,
  onAchievementsClick,
  onDailyRewardClick,
  onSocialClick,
  onBattlePassClick,
  onChallengesClick,
}: MobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-50">
      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 p-2">
        <Button
          variant="ghost"
          size="lg"
          onClick={onInventoryClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Package className="h-5 w-5" />
          <span className="text-xs">Items</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onCosmeticClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-xs">Cosmetic</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onLootboxClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Gift className="h-5 w-5 text-yellow-500" />
          <span className="text-xs">Lootbox</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onShopClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs">Shop</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onLeaderboardClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Trophy className="h-5 w-5" />
          <span className="text-xs">Ranks</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onAchievementsClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Award className="h-5 w-5 text-purple-500" />
          <span className="text-xs">Achieve</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onDailyRewardClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Calendar className="h-5 w-5 text-orange-500" />
          <span className="text-xs">Daily</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onSocialClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Users className="h-5 w-5 text-green-500" />
          <span className="text-xs">Social</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onBattlePassClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Zap className="h-5 w-5 text-blue-500" />
          <span className="text-xs">Pass</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onChallengesClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Target className="h-5 w-5 text-red-500" />
          <span className="text-xs">Tasks</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={onSettingsClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
};