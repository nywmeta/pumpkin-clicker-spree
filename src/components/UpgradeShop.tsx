import { Upgrade } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sword } from "lucide-react";

interface UpgradeShopProps {
  upgrades: Upgrade[];
  currency: number;
  onPurchase: (upgradeId: string) => void;
}

export const UpgradeShop = ({ upgrades, currency, onPurchase }: UpgradeShopProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute right-4 top-20 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <Card className="bg-card/90 backdrop-blur border-border p-4">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sword className="h-5 w-5" />
          Upgrade Shop
        </h2>
        
        <div className="space-y-2">
          {upgrades.map((upgrade) => {
            const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned));
            const canAfford = currency >= cost;
            
            return (
              <Card key={upgrade.id} className="p-3 bg-background/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-foreground">{upgrade.name}</h3>
                    <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                  </div>
                  {upgrade.owned > 0 && (
                    <span className="text-xs font-bold text-accent">x{upgrade.owned}</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-muted-foreground">+{upgrade.damageIncrease} DMG</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onPurchase(upgrade.id)}
                    disabled={!canAfford}
                    className="text-xs"
                  >
                    {formatNumber(cost)}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
