import { ShoppingBag, Coins, X } from "lucide-react";
import { Upgrade } from "@/types/game";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface UpgradeShopProps {
  open: boolean;
  onClose: () => void;
  upgrades: Upgrade[];
  currency: number;
  onPurchase: (upgradeId: string) => void;
}

export const UpgradeShop = ({ open, onClose, upgrades, currency, onPurchase }: UpgradeShopProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num).toString();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-96 overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Upgrade Shop
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-bold">{formatNumber(currency)}</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-2 pr-4">
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
