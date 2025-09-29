import { Button } from "@/components/ui/button";

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  currentCost: number;
  owned: number;
  pumpkinsPerSecond: number;
  icon: string;
}

interface UpgradeShopProps {
  upgrades: Upgrade[];
  pumpkins: number;
  onPurchaseUpgrade: (upgradeId: string) => void;
}

export const UpgradeShop = ({ upgrades, pumpkins, onPurchaseUpgrade }: UpgradeShopProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-foreground mb-6">
        Upgrades
      </h2>
      
      <div className="space-y-3">
        {upgrades.map((upgrade) => {
          const canAfford = pumpkins >= upgrade.currentCost;
          
          return (
            <div
              key={upgrade.id}
              className={`upgrade-card ${
                canAfford ? "affordable" : "expensive"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{upgrade.icon}</div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {upgrade.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {upgrade.description}
                    </p>
                    <p className="text-xs text-accent font-medium">
                      +{formatNumber(upgrade.pumpkinsPerSecond)} per second
                    </p>
                    {upgrade.owned > 0 && (
                      <p className="text-xs text-success">
                        Owned: {upgrade.owned}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <Button
                    onClick={() => onPurchaseUpgrade(upgrade.id)}
                    disabled={!canAfford}
                    variant={canAfford ? "default" : "secondary"}
                    size="sm"
                  >
                    {formatNumber(upgrade.currentCost)}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};