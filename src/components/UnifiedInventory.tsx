import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryItem } from "@/types/game";
import { RARITY_COLORS, RARITY_NAMES, RarityTier } from "@/types/game";
import { Sword, Sparkles, Trash2, Hammer } from "lucide-react";

interface CosmeticItem {
  id: string;
  cosmetic_name: string;
  cosmetic_type: string;
  rarity: RarityTier;
  equipped: boolean;
}

interface UnifiedInventoryProps {
  open: boolean;
  onClose: () => void;
  items: InventoryItem[];
  cosmetics: CosmeticItem[];
  craftingMaterials: number;
  leftHandWeapon?: string | null;
  rightHandWeapon?: string | null;
  onEquipItem: (itemId: string, slot: 'left_hand' | 'right_hand') => void;
  onSalvageItem: (itemId: string) => void;
  onCraftItem: (rarityIndex: number) => void;
  onEquipCosmetic: (cosmeticId: string, cosmeticType: string) => void;
}

export const UnifiedInventory = ({
  open,
  onClose,
  items,
  cosmetics,
  craftingMaterials,
  leftHandWeapon,
  rightHandWeapon,
  onEquipItem,
  onSalvageItem,
  onCraftItem,
  onEquipCosmetic,
}: UnifiedInventoryProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  const getCraftCost = (rarity: RarityTier): number => {
    const costs: Record<RarityTier, number> = {
      gray: 100,
      light_blue: 250,
      blue: 500,
      green: 1000,
      yellow: 2500,
      orange: 5000,
      red: 10000,
      pink: 25000,
      violet: 50000,
      black: 100000,
    };
    return costs[rarity];
  };

  const craftableRarities: { rarity: RarityTier; index: number }[] = [
    { rarity: 'blue', index: 2 },
    { rarity: 'green', index: 3 },
    { rarity: 'yellow', index: 4 },
    { rarity: 'orange', index: 5 },
    { rarity: 'red', index: 6 },
  ];

  const renderEquippedSlots = () => (
    <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
      <Card className="bg-card/50 backdrop-blur border-border p-4">
        <div className="flex flex-col items-center justify-center h-24">
          <Sword className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm font-semibold text-muted-foreground mb-1">Left Hand</span>
          {leftHandWeapon ? (
            <span className="text-xs font-bold text-primary">{leftHandWeapon}</span>
          ) : (
            <span className="text-xs text-muted-foreground/50">Empty</span>
          )}
        </div>
      </Card>
      
      <Card className="bg-card/50 backdrop-blur border-border p-4">
        <div className="flex flex-col items-center justify-center h-24">
          <Sword className="h-8 w-8 text-muted-foreground mb-2 -scale-x-100" />
          <span className="text-sm font-semibold text-muted-foreground mb-1">Right Hand</span>
          {rightHandWeapon ? (
            <span className="text-xs font-bold text-primary">{rightHandWeapon}</span>
          ) : (
            <span className="text-xs text-muted-foreground/50">Empty</span>
          )}
        </div>
      </Card>
    </div>
  );

  const renderItem = (item: InventoryItem) => (
    <Card
      key={item.id}
      className="bg-card/80 backdrop-blur border-border p-4 hover:bg-card/90 transition-colors"
      style={{ borderColor: RARITY_COLORS[item.rarity] }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">{item.item_name}</h3>
          <span
            className="text-xs font-semibold"
            style={{ color: RARITY_COLORS[item.rarity] }}
          >
            {RARITY_NAMES[item.rarity]}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Damage Bonus:</span> +{formatNumber(item.damage_bonus)}
        </div>
        
        {item.equipped && item.slot && (
          <div className="text-sm font-semibold text-primary">
            Equipped: {item.slot === 'left_hand' ? 'Left Hand' : 'Right Hand'}
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          {!item.equipped && (
            <>
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={() => onEquipItem(item.id, 'left_hand')}
              >
                Equip Left
              </Button>
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={() => onEquipItem(item.id, 'right_hand')}
              >
                Equip Right
              </Button>
            </>
          )}
          {item.equipped && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEquipItem(item.id, 'left_hand')}
            >
              Unequip
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onSalvageItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderCosmeticCard = (cosmetic: CosmeticItem) => (
    <Card
      key={cosmetic.id}
      className="bg-card/80 backdrop-blur border-border p-4 hover:bg-card/90 transition-colors"
      style={{ borderColor: RARITY_COLORS[cosmetic.rarity] }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-foreground">{cosmetic.cosmetic_name}</h3>
            <span
              className="text-xs font-semibold"
              style={{ color: RARITY_COLORS[cosmetic.rarity] }}
            >
              {RARITY_NAMES[cosmetic.rarity]}
            </span>
          </div>
          <span className="text-xs text-muted-foreground capitalize">
            {cosmetic.cosmetic_type}
          </span>
        </div>
        
        <Button
          size="sm"
          variant={cosmetic.equipped ? "outline" : "default"}
          onClick={() => onEquipCosmetic(cosmetic.id, cosmetic.cosmetic_type)}
          disabled={cosmetic.equipped}
          className="w-full"
        >
          {cosmetic.equipped ? "Equipped" : "Equip"}
        </Button>
      </div>
    </Card>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-xl bg-background/95 backdrop-blur">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5" />
            Inventory
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {renderEquippedSlots()}

          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="cosmetics">Cosmetics</TabsTrigger>
              <TabsTrigger value="craft">Craft</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="mt-4">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-3 pr-4">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sword className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No items yet. Defeat bosses to get drops!</p>
                    </div>
                  ) : (
                    items.map(renderItem)
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="cosmetics" className="mt-4">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-3 pr-4">
                  {cosmetics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No cosmetics yet. Open lootboxes to get some!</p>
                    </div>
                  ) : (
                    cosmetics.map(renderCosmeticCard)
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="craft" className="mt-4">
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Crafting Materials:</span>
                  <span className="text-lg font-bold text-primary">{formatNumber(craftingMaterials)}</span>
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="space-y-3 pr-4">
                  {craftableRarities.map(({ rarity, index }) => {
                    const cost = getCraftCost(rarity);
                    const canCraft = craftingMaterials >= cost;

                    return (
                      <Card
                        key={rarity}
                        className="bg-card/80 backdrop-blur border-border p-4"
                        style={{ borderColor: RARITY_COLORS[rarity] }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3
                              className="font-bold text-lg"
                              style={{ color: RARITY_COLORS[rarity] }}
                            >
                              {RARITY_NAMES[rarity]} Weapon
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Cost: {formatNumber(cost)} materials
                            </p>
                          </div>
                          <Button
                            onClick={() => onCraftItem(index)}
                            disabled={!canCraft}
                            size="sm"
                            className="gap-2"
                          >
                            <Hammer className="h-4 w-4" />
                            Craft
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
