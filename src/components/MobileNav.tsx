import { ShoppingBag, Package, Settings, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  onInventoryClick: () => void;
  onShopClick: () => void;
  onSettingsClick: () => void;
  onLeaderboardClick: () => void;
}

export const MobileNav = ({
  onInventoryClick,
  onShopClick,
  onSettingsClick,
  onLeaderboardClick,
}: MobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-50">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Button
          variant="ghost"
          size="lg"
          onClick={onInventoryClick}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Package className="h-5 w-5" />
          <span className="text-xs">Inventory</span>
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