import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RARITY_COLORS, RARITY_NAMES, RarityTier } from '@/types/game';
import { Gem, Package, Sparkles, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface PremiumShopProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  premiumCurrency: number;
  currency: number;
  onPurchase: () => void;
}

interface CosmeticShopItem {
  name: string;
  type: 'skin' | 'effect' | 'frame' | 'emote';
  rarity: RarityTier;
  price: number;
  featured?: boolean;
}

const COSMETIC_SHOP: CosmeticShopItem[] = [
  // Featured Items
  { name: 'Celestial Pumpkin', type: 'skin', rarity: 'violet', price: 500, featured: true },
  { name: 'Cosmic Aura', type: 'effect', rarity: 'pink', price: 400, featured: true },
  
  // Premium Skins
  { name: 'Golden Pumpkin', type: 'skin', rarity: 'yellow', price: 150 },
  { name: 'Diamond Pumpkin', type: 'skin', rarity: 'orange', price: 250 },
  { name: 'Shadow Pumpkin', type: 'skin', rarity: 'black', price: 600 },
  { name: 'Crystal Pumpkin', type: 'skin', rarity: 'blue', price: 100 },
  
  // Effects
  { name: 'Fire Trail', type: 'effect', rarity: 'blue', price: 80 },
  { name: 'Lightning Aura', type: 'effect', rarity: 'green', price: 120 },
  { name: 'Ice Crystals', type: 'effect', rarity: 'yellow', price: 180 },
  { name: 'Dark Energy', type: 'effect', rarity: 'red', price: 220 },
  { name: 'Divine Light', type: 'effect', rarity: 'pink', price: 350 },
  
  // Frames
  { name: 'Silver Frame', type: 'frame', rarity: 'blue', price: 75 },
  { name: 'Gold Frame', type: 'frame', rarity: 'yellow', price: 150 },
  { name: 'Platinum Frame', type: 'frame', rarity: 'orange', price: 250 },
  { name: 'Mythic Frame', type: 'frame', rarity: 'violet', price: 450 },
  
  // Emotes
  { name: '🎃 Pumpkin Dance', type: 'emote', rarity: 'light_blue', price: 50 },
  { name: '👑 Victory', type: 'emote', rarity: 'green', price: 100 },
  { name: '⚡ Lightning Strike', type: 'emote', rarity: 'yellow', price: 150 },
  { name: '💀 Skull Laugh', type: 'emote', rarity: 'red', price: 200 },
  { name: '🌟 Star Power', type: 'emote', rarity: 'pink', price: 300 },
];

const LOOTBOX_BUNDLES = [
  { id: 'basic', name: 'Basic Lootbox', price: 50, items: 3, color: '#9CA3AF' },
  { id: 'premium', name: 'Premium Lootbox', price: 150, items: 5, color: '#3B82F6' },
  { id: 'legendary', name: 'Legendary Lootbox', price: 400, items: 7, color: '#EAB308' },
];

const CURRENCY_BUNDLES = [
  { gems: 100, price: 10000, bonus: 0 },
  { gems: 250, price: 20000, bonus: 50 },
  { gems: 600, price: 40000, bonus: 150 },
  { gems: 1500, price: 80000, bonus: 500 },
];

const PremiumShop = ({ open, onClose, userId, premiumCurrency, currency, onPurchase }: PremiumShopProps) => {
  const [purchasing, setPurchasing] = useState(false);

  const purchaseCosmetic = async (item: CosmeticShopItem) => {
    if (premiumCurrency < item.price) {
      toast.error('Not enough gems!');
      return;
    }

    setPurchasing(true);
    try {
      // Check if already owned
      const { data: existing } = await supabase
        .from('cosmetic_inventory')
        .select('id')
        .eq('user_id', userId)
        .eq('cosmetic_name', item.name)
        .single();

      if (existing) {
        toast.error('You already own this item!');
        return;
      }

      // Insert cosmetic
      const { error: cosmeticError } = await supabase
        .from('cosmetic_inventory')
        .insert({
          user_id: userId,
          cosmetic_type: item.type,
          cosmetic_name: item.name,
          rarity: item.rarity,
        });

      if (cosmeticError) throw cosmeticError;

      // Deduct premium currency
      const { error: updateError } = await supabase
        .from('player_progress')
        .update({ premium_currency: premiumCurrency - item.price })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast.success(`Purchased ${item.name}!`);
      onPurchase();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase item');
    } finally {
      setPurchasing(false);
    }
  };

  const purchaseLootbox = async (boxId: string, price: number) => {
    if (premiumCurrency < price) {
      toast.error('Not enough gems!');
      return;
    }

    setPurchasing(true);
    try {
      // Deduct premium currency
      const { error } = await supabase
        .from('player_progress')
        .update({ premium_currency: premiumCurrency - price })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`Purchased ${boxId} lootbox! Open it from your inventory.`);
      onPurchase();
      // Note: Actual lootbox opening would be handled by the lootbox component
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase lootbox');
    } finally {
      setPurchasing(false);
    }
  };

  const purchaseCurrencyBundle = async (gems: number, price: number) => {
    if (currency < price) {
      toast.error('Not enough currency!');
      return;
    }

    setPurchasing(true);
    try {
      // Fetch current values
      const { data: progressData } = await supabase
        .from('player_progress')
        .select('currency, premium_currency')
        .eq('user_id', userId)
        .single();

      if (!progressData) throw new Error('Progress not found');

      // Update both currencies
      const { error } = await supabase
        .from('player_progress')
        .update({
          currency: progressData.currency - price,
          premium_currency: progressData.premium_currency + gems,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`Purchased ${gems} gems!`);
      onPurchase();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase gems');
    } finally {
      setPurchasing(false);
    }
  };

  const featuredItems = COSMETIC_SHOP.filter(item => item.featured);
  const regularItems = COSMETIC_SHOP.filter(item => !item.featured);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-2">
            <Crown className="w-8 h-8 text-primary" />
            Premium Shop
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Gem className="w-4 h-4 text-primary" />
              <span className="font-bold">{premiumCurrency}</span>
              <span className="text-muted-foreground">Gems</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">{currency.toLocaleString()}</span>
              <span className="text-muted-foreground">Gold</span>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="featured"><Sparkles className="w-4 h-4 mr-1" />Featured</TabsTrigger>
            <TabsTrigger value="cosmetics"><Crown className="w-4 h-4 mr-1" />Cosmetics</TabsTrigger>
            <TabsTrigger value="lootboxes"><Package className="w-4 h-4 mr-1" />Lootboxes</TabsTrigger>
            <TabsTrigger value="currency"><Gem className="w-4 h-4 mr-1" />Gems</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[55vh]">
            {/* Featured Tab */}
            <TabsContent value="featured" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredItems.map((item) => (
                  <Card
                    key={item.name}
                    className="p-6 space-y-3 relative overflow-hidden"
                    style={{
                      borderColor: RARITY_COLORS[item.rarity],
                      borderWidth: '3px',
                      boxShadow: `0 0 20px ${RARITY_COLORS[item.rarity]}40`,
                    }}
                  >
                    <Badge className="absolute top-2 right-2 bg-primary">FEATURED</Badge>
                    <div className="text-center space-y-2">
                      <div className="text-6xl">
                        {item.type === 'skin' && '🎃'}
                        {item.type === 'effect' && '✨'}
                        {item.type === 'frame' && '🖼️'}
                        {item.type === 'emote' && '😄'}
                      </div>
                      <p className="font-bold text-xl">{item.name}</p>
                      <Badge style={{ backgroundColor: RARITY_COLORS[item.rarity] }}>
                        {RARITY_NAMES[item.rarity]}
                      </Badge>
                      <div className="flex items-center justify-center gap-1 text-primary font-bold text-lg">
                        <Gem className="w-5 h-5" />
                        {item.price}
                      </div>
                    </div>
                    <Button
                      onClick={() => purchaseCosmetic(item)}
                      disabled={purchasing}
                      className="w-full"
                      size="lg"
                    >
                      Purchase
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Cosmetics Tab */}
            <TabsContent value="cosmetics">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {regularItems.map((item) => (
                  <Card
                    key={item.name}
                    className="p-4 space-y-2"
                    style={{
                      borderColor: RARITY_COLORS[item.rarity],
                      borderWidth: '2px',
                    }}
                  >
                    <div className="text-center space-y-1">
                      <div className="text-4xl">
                        {item.type === 'skin' && '🎃'}
                        {item.type === 'effect' && '✨'}
                        {item.type === 'frame' && '🖼️'}
                        {item.type === 'emote' && '😄'}
                      </div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p
                        className="text-xs"
                        style={{ color: RARITY_COLORS[item.rarity] }}
                      >
                        {RARITY_NAMES[item.rarity]}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-primary font-bold">
                        <Gem className="w-4 h-4" />
                        {item.price}
                      </div>
                    </div>
                    <Button
                      onClick={() => purchaseCosmetic(item)}
                      disabled={purchasing}
                      size="sm"
                      className="w-full"
                    >
                      Buy
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Lootboxes Tab */}
            <TabsContent value="lootboxes">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {LOOTBOX_BUNDLES.map((bundle) => (
                  <Card
                    key={bundle.id}
                    className="p-6 space-y-4 text-center"
                    style={{
                      borderColor: bundle.color,
                      borderWidth: '2px',
                    }}
                  >
                    <Package className="w-16 h-16 mx-auto" style={{ color: bundle.color }} />
                    <div>
                      <h3 className="font-bold text-lg">{bundle.name}</h3>
                      <p className="text-sm text-muted-foreground">{bundle.items} items</p>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-primary font-bold text-xl">
                      <Gem className="w-5 h-5" />
                      {bundle.price}
                    </div>
                    <Button
                      onClick={() => purchaseLootbox(bundle.id, bundle.price)}
                      disabled={purchasing}
                      className="w-full"
                    >
                      Purchase
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Currency Tab */}
            <TabsContent value="currency">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CURRENCY_BUNDLES.map((bundle, idx) => (
                  <Card
                    key={idx}
                    className="p-6 space-y-4 relative"
                  >
                    {bundle.bonus > 0 && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        +{bundle.bonus} BONUS
                      </Badge>
                    )}
                    <div className="text-center space-y-2">
                      <Gem className="w-16 h-16 mx-auto text-primary" />
                      <h3 className="font-bold text-2xl">{bundle.gems + bundle.bonus} Gems</h3>
                      {bundle.bonus > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ({bundle.gems} + {bundle.bonus} bonus)
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{bundle.price.toLocaleString()} Gold</p>
                    </div>
                    <Button
                      onClick={() => purchaseCurrencyBundle(bundle.gems + bundle.bonus, bundle.price)}
                      disabled={purchasing}
                      className="w-full"
                      variant="default"
                    >
                      Purchase
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumShop;
