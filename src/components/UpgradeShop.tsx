import { ShoppingBag, Coins, X, Sword, Zap, Sparkles, TrendingUp, Crown, Flame } from "lucide-react";
import { Upgrade } from "@/types/game";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attack': return <Sword className="h-4 w-4" />;
      case 'critical': return <Zap className="h-4 w-4" />;
      case 'magic': return <Sparkles className="h-4 w-4" />;
      case 'utility': return <TrendingUp className="h-4 w-4" />;
      case 'special': return <Crown className="h-4 w-4" />;
      case 'ultimate': return <Flame className="h-4 w-4" />;
      default: return <Sword className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'common': return 'text-gray-400 border-gray-400/30';
      case 'uncommon': return 'text-green-400 border-green-400/30';
      case 'rare': return 'text-blue-400 border-blue-400/30';
      case 'epic': return 'text-purple-400 border-purple-400/30';
      case 'legendary': return 'text-orange-400 border-orange-400/30';
      default: return 'text-gray-400 border-gray-400/30';
    }
  };

  const getTierGlow = (tier: string) => {
    switch (tier) {
      case 'legendary': return 'shadow-[0_0_15px_rgba(251,146,60,0.3)]';
      case 'epic': return 'shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'rare': return 'shadow-[0_0_8px_rgba(59,130,246,0.3)]';
      default: return '';
    }
  };

  const getCategoryUpgrades = (category: string) => {
    return upgrades.filter(u => u.category === category);
  };

  const renderUpgradeCard = (upgrade: Upgrade) => {
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned));
    const canAfford = currency >= cost;
    
    return (
      <Card 
        key={upgrade.id} 
        className={`p-4 bg-gradient-to-br from-background/50 to-background/30 border-2 transition-all hover:scale-[1.02] ${getTierGlow(upgrade.tier)}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-2 flex-1">
            <div className={`p-2 rounded-lg bg-background/50 ${getTierColor(upgrade.tier)}`}>
              {getCategoryIcon(upgrade.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">{upgrade.name}</h3>
                <Badge variant="outline" className={`text-xs ${getTierColor(upgrade.tier)}`}>
                  {upgrade.tier}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{upgrade.description}</p>
            </div>
          </div>
          {upgrade.owned > 0 && (
            <Badge className="bg-primary/20 text-primary border-primary/30 ml-2">
              x{upgrade.owned}
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-primary">
              +{formatNumber(upgrade.damageIncrease)} DMG
            </span>
            <span className="text-xs text-muted-foreground">
              per purchase
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => onPurchase(upgrade.id)}
            disabled={!canAfford}
            className={`min-w-[100px] ${canAfford ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700' : ''}`}
          >
            <Coins className="h-3 w-3 mr-1" />
            {formatNumber(cost)}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-[600px] overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xl">Upgrade Shop</div>
                <div className="text-xs text-muted-foreground font-normal">
                  Enhance your power
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-yellow-500">{formatNumber(currency)}</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="all" className="flex-1 flex flex-col mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="attack" className="text-xs">
              <Sword className="h-3 w-3 mr-1" />
              Attack
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Critical
            </TabsTrigger>
            <TabsTrigger value="magic" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Magic
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid grid-cols-3 w-full mt-2">
            <TabsTrigger value="utility" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Utility
            </TabsTrigger>
            <TabsTrigger value="special" className="text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Special
            </TabsTrigger>
            <TabsTrigger value="ultimate" className="text-xs">
              <Flame className="h-3 w-3 mr-1" />
              Ultimate
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="all" className="space-y-3 pr-4 mt-0">
              {upgrades.map(renderUpgradeCard)}
            </TabsContent>

            <TabsContent value="attack" className="space-y-3 pr-4 mt-0">
              {getCategoryUpgrades('attack').map(renderUpgradeCard)}
            </TabsContent>

            <TabsContent value="critical" className="space-y-3 pr-4 mt-0">
              {getCategoryUpgrades('critical').map(renderUpgradeCard)}
            </TabsContent>

            <TabsContent value="magic" className="space-y-3 pr-4 mt-0">
              {getCategoryUpgrades('magic').map(renderUpgradeCard)}
            </TabsContent>

            <TabsContent value="utility" className="space-y-3 pr-4 mt-0">
              {getCategoryUpgrades('utility').map(renderUpgradeCard)}
            </TabsContent>

            <TabsContent value="special" className="space-y-3 pr-4 mt-0">
              {getCategoryUpgrades('special').map(renderUpgradeCard)}
            </TabsContent>

            <TabsContent value="ultimate" className="space-y-3 pr-4 mt-0">
              {getCategoryUpgrades('ultimate').map(renderUpgradeCard)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
