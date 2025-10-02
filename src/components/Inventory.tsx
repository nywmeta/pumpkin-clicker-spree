import { Package, Trash2, Hammer, X } from "lucide-react";
import { InventoryItem, RARITY_COLORS, RARITY_NAMES } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface InventoryProps {
  open: boolean;
  onClose: () => void;
  items: InventoryItem[];
  craftingMaterials: number;
  onEquip: (itemId: string, slot: 'left_hand' | 'right_hand') => void;
  onSalvage: (itemId: string) => void;
  onCraft: (rarityIndex: number) => void;
}

export const Inventory = ({
  open,
  onClose,
  items,
  craftingMaterials,
  onEquip,
  onSalvage,
  onCraft,
}: InventoryProps) => {
  const weapons = items.filter(i => i.item_type === 'weapon');
  const upgrades = items.filter(i => i.item_type === 'upgrade');

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num).toString();
  };

  const getCraftCost = (rarity: number) => {
    return Math.floor(100 * Math.pow(2, rarity));
  };

  const renderItem = (item: InventoryItem) => (
    <Card 
      key={item.id} 
      className="p-3 bg-background/50"
      style={{ borderColor: RARITY_COLORS[item.rarity], borderWidth: '2px' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 
            className="font-bold text-sm"
            style={{ color: RARITY_COLORS[item.rarity] }}
          >
            {item.item_name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {RARITY_NAMES[item.rarity]} • +{item.damage_bonus} DMG
          </p>
          {item.equipped && (
            <span className="text-xs font-bold text-accent">
              Equipped ({item.slot?.replace('_', ' ')})
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        {item.item_type === 'weapon' && !item.equipped && (
          <>
            <Button
              size="sm"
              onClick={() => onEquip(item.id, 'left_hand')}
              className="text-xs flex-1"
              variant="outline"
            >
              Left
            </Button>
            <Button
              size="sm"
              onClick={() => onEquip(item.id, 'right_hand')}
              className="text-xs flex-1"
              variant="outline"
            >
              Right
            </Button>
          </>
        )}
        <Button
          size="sm"
          onClick={() => onSalvage(item.id)}
          variant="destructive"
          className="text-xs"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          {item.materials}
        </Button>
      </div>
    </Card>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-96 overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory
            </div>
            <div className="flex items-center gap-2">
              <Hammer className="h-4 w-4 text-accent" />
              <span className="font-bold text-accent text-sm">{formatNumber(craftingMaterials)}</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="weapons" className="flex-1 flex flex-col mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weapons">Weapons</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
            <TabsTrigger value="craft">Craft</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weapons" className="flex-1 mt-2">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {weapons.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No weapons yet. Defeat bosses to get drops!
                  </p>
                ) : (
                  weapons.map(renderItem)
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="upgrades" className="flex-1 mt-2">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {upgrades.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No upgrades yet. Defeat bosses to get drops!
                  </p>
                ) : (
                  upgrades.map(renderItem)
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="craft" className="flex-1 mt-2">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {Object.entries(RARITY_NAMES).map(([rarity, name], index) => {
                  const cost = getCraftCost(index);
                  const canAfford = craftingMaterials >= cost;
                  
                  return (
                    <Card 
                      key={rarity} 
                      className="p-3 bg-background/50"
                      style={{ borderColor: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS], borderWidth: '2px' }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 
                            className="font-bold text-sm"
                            style={{ color: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] }}
                          >
                            {name} Weapon
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            +{Math.floor(10 * Math.pow(1.5, index))} DMG
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onCraft(index)}
                          disabled={!canAfford}
                          className="text-xs"
                        >
                          <Hammer className="h-3 w-3 mr-1" />
                          {formatNumber(cost)}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
