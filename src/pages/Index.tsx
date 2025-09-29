import { PumpkinClicker } from "@/components/PumpkinClicker";
import { GameStats } from "@/components/GameStats";
import { UpgradeShop } from "@/components/UpgradeShop";
import { useGameState } from "@/hooks/useGameState";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-foreground mb-2">
          🎃 Pumpkin Clicker
        </h1>
        <p className="text-lg text-muted-foreground">
          Click the pumpkin to harvest your autumn bounty!
        </p>
      </header>

      {/* Game Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Game Stats */}
          <div className="lg:col-span-1">
            <GameStats 
              pumpkins={pumpkins} 
              pumpkinsPerSecond={pumpkinsPerSecond} 
            />
          </div>

          {/* Main Clicker */}
          <div className="lg:col-span-1 flex items-center justify-center">
            <PumpkinClicker 
              onPumpkinClick={clickPumpkin}
              pumpkinsPerClick={pumpkinsPerClick}
            />
          </div>

          {/* Upgrade Shop */}
          <div className="lg:col-span-1">
            <UpgradeShop
              upgrades={upgrades}
              pumpkins={pumpkins}
              onPurchaseUpgrade={purchaseUpgrade}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-muted-foreground">
        <p className="text-sm">
          🍂 Happy harvesting! Your progress is automatically saved. 🍂
        </p>
      </footer>
    </div>
  );
};

export default Index;
