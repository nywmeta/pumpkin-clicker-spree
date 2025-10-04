import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RarityTier } from '@/types/game';
import { toast } from 'sonner';

interface CosmeticItem {
  id: string;
  user_id: string;
  cosmetic_type: 'skin' | 'effect' | 'frame' | 'emote';
  cosmetic_name: string;
  rarity: RarityTier;
  created_at: string;
  equipped: boolean;
}

const COSMETIC_POOL = [
  // Skins
  { name: 'Spooky Pumpkin', type: 'skin' as const, rarity: 'green' as RarityTier },
  { name: 'Golden Pumpkin', type: 'skin' as const, rarity: 'yellow' as RarityTier },
  { name: 'Diamond Pumpkin', type: 'skin' as const, rarity: 'orange' as RarityTier },
  { name: 'Rainbow Pumpkin', type: 'skin' as const, rarity: 'pink' as RarityTier },
  { name: 'Shadow Pumpkin', type: 'skin' as const, rarity: 'black' as RarityTier },
  
  // Effects
  { name: 'Fire Trail', type: 'effect' as const, rarity: 'blue' as RarityTier },
  { name: 'Lightning Aura', type: 'effect' as const, rarity: 'green' as RarityTier },
  { name: 'Ice Crystals', type: 'effect' as const, rarity: 'yellow' as RarityTier },
  { name: 'Dark Energy', type: 'effect' as const, rarity: 'red' as RarityTier },
  { name: 'Divine Light', type: 'effect' as const, rarity: 'pink' as RarityTier },
  
  // Frames
  { name: 'Bronze Frame', type: 'frame' as const, rarity: 'light_blue' as RarityTier },
  { name: 'Silver Frame', type: 'frame' as const, rarity: 'blue' as RarityTier },
  { name: 'Gold Frame', type: 'frame' as const, rarity: 'yellow' as RarityTier },
  { name: 'Platinum Frame', type: 'frame' as const, rarity: 'orange' as RarityTier },
  { name: 'Mythic Frame', type: 'frame' as const, rarity: 'violet' as RarityTier },
  
  // Emotes
  { name: '😎 Cool Guy', type: 'emote' as const, rarity: 'gray' as RarityTier },
  { name: '🎃 Pumpkin Dance', type: 'emote' as const, rarity: 'light_blue' as RarityTier },
  { name: '👑 Victory', type: 'emote' as const, rarity: 'green' as RarityTier },
  { name: '⚡ Lightning Strike', type: 'emote' as const, rarity: 'yellow' as RarityTier },
  { name: '💀 Skull Laugh', type: 'emote' as const, rarity: 'red' as RarityTier },
];

export const useCosmetics = (userId: string | undefined) => {
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCosmetics = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('cosmetic_inventory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCosmetics((data || []) as CosmeticItem[]);
    } catch (error) {
      console.error('Error loading cosmetics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const openLootbox = useCallback(async (boxType: 'basic' | 'premium' | 'legendary') => {
    if (!userId) return null;

    // Determine number of items and rarity chances based on box type
    const itemCount = boxType === 'basic' ? 3 : boxType === 'premium' ? 5 : 7;
    const rarityWeights = boxType === 'basic' 
      ? [50, 30, 15, 5, 0, 0, 0, 0, 0, 0] // Common to Primordial
      : boxType === 'premium'
      ? [20, 25, 25, 15, 10, 5, 0, 0, 0, 0]
      : [5, 10, 15, 20, 20, 15, 10, 5, 0, 0];

    const rarityTiers: RarityTier[] = ['gray', 'light_blue', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'violet', 'black'];
    
    const getRandomRarity = (): RarityTier => {
      const total = rarityWeights.reduce((a, b) => a + b, 0);
      let random = Math.random() * total;
      
      for (let i = 0; i < rarityWeights.length; i++) {
        random -= rarityWeights[i];
        if (random <= 0) return rarityTiers[i];
      }
      return 'gray';
    };

    const rewards: CosmeticItem[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const rarity = getRandomRarity();
      const validItems = COSMETIC_POOL.filter(item => item.rarity === rarity);
      const randomItem = validItems[Math.floor(Math.random() * validItems.length)];
      
      // Insert into database
      const { data, error } = await supabase
        .from('cosmetic_inventory')
        .upsert({
          user_id: userId,
          cosmetic_type: randomItem.type,
          cosmetic_name: randomItem.name,
          rarity: randomItem.rarity,
        }, {
          onConflict: 'user_id,cosmetic_name'
        })
        .select()
        .single();

      if (!error && data) {
        rewards.push(data as CosmeticItem);
      }
    }

    // Save lootbox history
    await supabase
      .from('lootbox_history')
      .insert({
        user_id: userId,
        box_type: boxType,
        items_received: rewards.map(r => ({ name: r.cosmetic_name, rarity: r.rarity })),
      });

    await loadCosmetics();
    return rewards;
  }, [userId, loadCosmetics]);

  const equipCosmetic = useCallback(async (cosmeticId: string, cosmeticType: string) => {
    if (!userId) return;

    try {
      // Unequip all items of this type first
      await supabase
        .from('cosmetic_inventory')
        .update({ equipped: false })
        .eq('user_id', userId)
        .eq('cosmetic_type', cosmeticType);

      // Equip the selected item
      const { error } = await supabase
        .from('cosmetic_inventory')
        .update({ equipped: true })
        .eq('id', cosmeticId);

      if (error) throw error;

      toast.success('Cosmetic equipped!');
      await loadCosmetics();
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
      toast.error('Failed to equip cosmetic');
    }
  }, [userId, loadCosmetics]);

  useEffect(() => {
    loadCosmetics();
  }, [loadCosmetics]);

  return {
    cosmetics,
    isLoading,
    openLootbox,
    equipCosmetic,
    refreshCosmetics: loadCosmetics,
  };
};
