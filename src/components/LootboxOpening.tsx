import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, Sparkles } from 'lucide-react';
import { RARITY_COLORS, RARITY_NAMES, RarityTier } from '@/types/game';

interface LootboxOpeningProps {
  open: boolean;
  onClose: () => void;
  onOpen: (boxType: 'basic' | 'premium' | 'legendary') => Promise<any>;
  premiumCurrency: number;
}

const LOOTBOX_COSTS = {
  basic: { currency: 100, premium: 0 },
  premium: { currency: 0, premium: 10 },
  legendary: { currency: 0, premium: 50 },
};

const LootboxOpening = ({ open, onClose, onOpen, premiumCurrency }: LootboxOpeningProps) => {
  const [opening, setOpening] = useState(false);
  const [rewards, setRewards] = useState<any[]>([]);
  const [showRewards, setShowRewards] = useState(false);

  const handleOpen = async (boxType: 'basic' | 'premium' | 'legendary') => {
    setOpening(true);
    setShowRewards(false);
    
    // Animation delay
    setTimeout(async () => {
      const items = await onOpen(boxType);
      setRewards(items || []);
      setShowRewards(true);
      setOpening(false);
    }, 2000);
  };

  const canAfford = (boxType: 'basic' | 'premium' | 'legendary') => {
    const cost = LOOTBOX_COSTS[boxType];
    return premiumCurrency >= cost.premium;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Lootbox Shop
          </DialogTitle>
        </DialogHeader>

        {!opening && !showRewards && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <Card className="p-4 space-y-3 border-2 hover:border-primary transition-colors">
              <div className="text-center">
                <Gift className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <h3 className="font-bold text-lg">Basic Box</h3>
                <p className="text-sm text-muted-foreground">3 items</p>
                <p className="text-sm text-muted-foreground mt-2">100 Gold</p>
              </div>
              <Button 
                onClick={() => handleOpen('basic')}
                className="w-full"
                variant="outline"
              >
                Open Basic
              </Button>
            </Card>

            <Card className="p-4 space-y-3 border-2 border-blue-500 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <Gift className="h-12 w-12 mx-auto mb-2 text-blue-400" />
                <h3 className="font-bold text-lg">Premium Box</h3>
                <p className="text-sm text-muted-foreground">5 items</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Sparkles className="h-4 w-4 inline" /> 10 Gems
                </p>
              </div>
              <Button 
                onClick={() => handleOpen('premium')}
                className="w-full"
                disabled={!canAfford('premium')}
              >
                Open Premium
              </Button>
            </Card>

            <Card className="p-4 space-y-3 border-2 border-yellow-500 hover:border-yellow-400 transition-colors">
              <div className="text-center">
                <Gift className="h-12 w-12 mx-auto mb-2 text-yellow-400" />
                <h3 className="font-bold text-lg">Legendary Box</h3>
                <p className="text-sm text-muted-foreground">7 items</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Sparkles className="h-4 w-4 inline" /> 50 Gems
                </p>
              </div>
              <Button 
                onClick={() => handleOpen('legendary')}
                className="w-full"
                variant="destructive"
                disabled={!canAfford('legendary')}
              >
                Open Legendary
              </Button>
            </Card>
          </div>
        )}

        {opening && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Gift className="h-24 w-24 animate-bounce text-primary" />
            <p className="text-xl font-bold animate-pulse">Opening...</p>
          </div>
        )}

        {showRewards && (
          <div className="space-y-4 p-4">
            <h3 className="text-xl font-bold text-center mb-4">You received:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {rewards.map((item, index) => (
                <Card 
                  key={index}
                  className="p-3 text-center animate-in fade-in zoom-in"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    borderColor: RARITY_COLORS[item.rarity as RarityTier],
                    borderWidth: '2px'
                  }}
                >
                  <div className="text-2xl mb-2">
                    {item.cosmetic_type === 'skin' && '🎃'}
                    {item.cosmetic_type === 'effect' && '✨'}
                    {item.cosmetic_type === 'frame' && '🖼️'}
                    {item.cosmetic_type === 'emote' && '😄'}
                  </div>
                  <p className="font-semibold text-sm">{item.cosmetic_name}</p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: RARITY_COLORS[item.rarity as RarityTier] }}
                  >
                    {RARITY_NAMES[item.rarity as RarityTier]}
                  </p>
                </Card>
              ))}
            </div>
            <Button 
              onClick={() => {
                setShowRewards(false);
                setRewards([]);
              }}
              className="w-full"
            >
              Open Another
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LootboxOpening;
