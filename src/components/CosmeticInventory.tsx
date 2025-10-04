import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RARITY_COLORS, RARITY_NAMES, RarityTier } from '@/types/game';
import { Check } from 'lucide-react';

interface CosmeticInventoryProps {
  open: boolean;
  onClose: () => void;
  cosmetics: any[];
  onEquip: (cosmeticId: string, cosmeticType: string) => void;
}

const CosmeticInventory = ({ open, onClose, cosmetics, onEquip }: CosmeticInventoryProps) => {
  const groupedCosmetics = {
    skin: cosmetics.filter(c => c.cosmetic_type === 'skin'),
    effect: cosmetics.filter(c => c.cosmetic_type === 'effect'),
    frame: cosmetics.filter(c => c.cosmetic_type === 'frame'),
    emote: cosmetics.filter(c => c.cosmetic_type === 'emote'),
  };

  const renderCosmeticCard = (cosmetic: any) => (
    <Card 
      key={cosmetic.id}
      className="p-4 space-y-2 relative"
      style={{ 
        borderColor: RARITY_COLORS[cosmetic.rarity as RarityTier],
        borderWidth: '2px'
      }}
    >
      {cosmetic.equipped && (
        <div className="absolute top-2 right-2">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        </div>
      )}
      
      <div className="text-center">
        <div className="text-4xl mb-2">
          {cosmetic.cosmetic_type === 'skin' && '🎃'}
          {cosmetic.cosmetic_type === 'effect' && '✨'}
          {cosmetic.cosmetic_type === 'frame' && '🖼️'}
          {cosmetic.cosmetic_type === 'emote' && '😄'}
        </div>
        <p className="font-semibold">{cosmetic.cosmetic_name}</p>
        <p 
          className="text-sm mt-1"
          style={{ color: RARITY_COLORS[cosmetic.rarity as RarityTier] }}
        >
          {RARITY_NAMES[cosmetic.rarity as RarityTier]}
        </p>
      </div>
      
      <Button 
        onClick={() => onEquip(cosmetic.id, cosmetic.cosmetic_type)}
        disabled={cosmetic.equipped}
        size="sm"
        className="w-full"
        variant={cosmetic.equipped ? "secondary" : "default"}
      >
        {cosmetic.equipped ? 'Equipped' : 'Equip'}
      </Button>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cosmetic Collection</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="skin" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skin">Skins ({groupedCosmetics.skin.length})</TabsTrigger>
            <TabsTrigger value="effect">Effects ({groupedCosmetics.effect.length})</TabsTrigger>
            <TabsTrigger value="frame">Frames ({groupedCosmetics.frame.length})</TabsTrigger>
            <TabsTrigger value="emote">Emotes ({groupedCosmetics.emote.length})</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[50vh]">
            <TabsContent value="skin">
              {groupedCosmetics.skin.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No skins yet. Open lootboxes to collect!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {groupedCosmetics.skin.map(renderCosmeticCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="effect">
              {groupedCosmetics.effect.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No effects yet. Open lootboxes to collect!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {groupedCosmetics.effect.map(renderCosmeticCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="frame">
              {groupedCosmetics.frame.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No frames yet. Open lootboxes to collect!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {groupedCosmetics.frame.map(renderCosmeticCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="emote">
              {groupedCosmetics.emote.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No emotes yet. Open lootboxes to collect!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {groupedCosmetics.emote.map(renderCosmeticCard)}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CosmeticInventory;
