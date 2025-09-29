import { PumpkinClicker } from "@/components/PumpkinClicker";
import { GameStats } from "@/components/GameStats";
import { UpgradeShop } from "@/components/UpgradeShop";
import { useGameState } from "@/hooks/useGameState";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const Index = () => {
  const {
    pumpkins,
    pumpkinsPerClick,
    pumpkinsPerSecond,
    upgrades,
    clickPumpkin,
    purchaseUpgrade
  } = useGameState();

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Stats in top left */}
      <div className="absolute top-4 left-4 z-10">
        <GameStats 
          pumpkins={pumpkins} 
          pumpkinsPerSecond={pumpkinsPerSecond} 
        />
      </div>

      {/* Upgrades button in top right */}
      <div className="absolute top-4 right-4 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="lg" className="rounded-full p-4">
              <ShoppingCart className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80 overflow-y-auto">
            <UpgradeShop
              upgrades={upgrades}
              pumpkins={pumpkins}
              onPurchaseUpgrade={purchaseUpgrade}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main clicker - centered and full screen */}
      <div className="flex-1 flex items-center justify-center">
        <PumpkinClicker 
          onPumpkinClick={clickPumpkin}
          pumpkinsPerClick={pumpkinsPerClick}
        />
      </div>
    </div>
  );
};

export default Index;
