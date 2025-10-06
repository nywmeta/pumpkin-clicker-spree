import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Season {
  id: string;
  season_number: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface BattlePassTier {
  id: string;
  season_id: string;
  tier_number: number;
  xp_required: number;
  free_reward_type: string;
  free_reward_amount: number | null;
  free_reward_cosmetic: string | null;
  premium_reward_type: string | null;
  premium_reward_amount: number | null;
  premium_reward_cosmetic: string | null;
}

interface UserProgress {
  id: string;
  user_id: string;
  season_id: string;
  current_tier: number;
  current_xp: number;
  has_premium: boolean;
  claimed_free_tiers: number[];
  claimed_premium_tiers: number[];
}

export const useBattlePass = (userId?: string) => {
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [tiers, setTiers] = useState<BattlePassTier[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    loadBattlePassData();
  }, [userId]);

  const loadBattlePassData = async () => {
    if (!userId) return;

    try {
      // Load active season
      const { data: seasonData, error: seasonError } = await supabase
        .from('battle_pass_seasons')
        .select('*')
        .eq('is_active', true)
        .single();

      if (seasonError) throw seasonError;
      setActiveSeason(seasonData);

      if (!seasonData) {
        setLoading(false);
        return;
      }

      // Load tiers for the active season
      const { data: tiersData, error: tiersError } = await supabase
        .from('battle_pass_tiers')
        .select('*')
        .eq('season_id', seasonData.id)
        .order('tier_number', { ascending: true });

      if (tiersError) throw tiersError;
      setTiers(tiersData || []);

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_battle_pass_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('season_id', seasonData.id)
        .maybeSingle();

      if (progressError) throw progressError;

      if (!progressData) {
        // Create initial progress
        const { data: newProgress, error: createError } = await supabase
          .from('user_battle_pass_progress')
          .insert({
            user_id: userId,
            season_id: seasonData.id,
            current_tier: 1,
            current_xp: 0,
            has_premium: false,
            claimed_free_tiers: [],
            claimed_premium_tiers: []
          })
          .select()
          .single();

        if (createError) throw createError;
        setUserProgress(newProgress);
      } else {
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading battle pass data:', error);
      toast.error('Failed to load battle pass');
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (xp: number) => {
    if (!userId || !activeSeason || !userProgress) return;

    try {
      let newXP = userProgress.current_xp + xp;
      let newTier = userProgress.current_tier;

      // Check if we can level up
      const currentTierData = tiers.find(t => t.tier_number === newTier);
      const nextTierData = tiers.find(t => t.tier_number === newTier + 1);

      if (nextTierData && newXP >= nextTierData.xp_required) {
        newTier++;
        toast.success(`Battle Pass Tier ${newTier} Unlocked!`);
      }

      const { data, error } = await supabase
        .from('user_battle_pass_progress')
        .update({
          current_xp: newXP,
          current_tier: newTier
        })
        .eq('user_id', userId)
        .eq('season_id', activeSeason.id)
        .select()
        .single();

      if (error) throw error;
      setUserProgress(data);
    } catch (error) {
      console.error('Error adding XP:', error);
      toast.error('Failed to add XP');
    }
  };

  const claimReward = async (tierNumber: number, isPremium: boolean) => {
    if (!userId || !activeSeason || !userProgress) return;

    // Check if already claimed
    const alreadyClaimed = isPremium 
      ? userProgress.claimed_premium_tiers.includes(tierNumber)
      : userProgress.claimed_free_tiers.includes(tierNumber);

    if (alreadyClaimed) {
      toast.error('Reward already claimed');
      return;
    }

    // Check if tier is unlocked
    if (tierNumber > userProgress.current_tier) {
      toast.error('Tier not yet unlocked');
      return;
    }

    // Check if premium is purchased
    if (isPremium && !userProgress.has_premium) {
      toast.error('Premium Battle Pass required');
      return;
    }

    try {
      const tier = tiers.find(t => t.tier_number === tierNumber);
      if (!tier) return;

      const newClaimedTiers = isPremium
        ? [...userProgress.claimed_premium_tiers, tierNumber]
        : [...userProgress.claimed_free_tiers, tierNumber];

      const { data, error } = await supabase
        .from('user_battle_pass_progress')
        .update(
          isPremium
            ? { claimed_premium_tiers: newClaimedTiers }
            : { claimed_free_tiers: newClaimedTiers }
        )
        .eq('user_id', userId)
        .eq('season_id', activeSeason.id)
        .select()
        .single();

      if (error) throw error;
      setUserProgress(data);

      // Handle reward based on type
      const rewardType = isPremium ? tier.premium_reward_type : tier.free_reward_type;
      const rewardAmount = isPremium ? tier.premium_reward_amount : tier.free_reward_amount;
      const rewardCosmetic = isPremium ? tier.premium_reward_cosmetic : tier.free_reward_cosmetic;

      if (rewardType === 'currency' && rewardAmount) {
        // Update player currency
        const { data: currentData } = await supabase
          .from('player_progress')
          .select('currency')
          .eq('user_id', userId)
          .single();
        
        if (currentData) {
          await supabase
            .from('player_progress')
            .update({ currency: currentData.currency + rewardAmount })
            .eq('user_id', userId);
        }
        toast.success(`Claimed ${rewardAmount} coins!`);
      } else if (rewardType === 'premium_currency' && rewardAmount) {
        const { data: currentData } = await supabase
          .from('player_progress')
          .select('premium_currency')
          .eq('user_id', userId)
          .single();
        
        if (currentData) {
          await supabase
            .from('player_progress')
            .update({ premium_currency: currentData.premium_currency + rewardAmount })
            .eq('user_id', userId);
        }
        toast.success(`Claimed ${rewardAmount} gems!`);
      } else if (rewardType === 'material' && rewardAmount) {
        const { data: currentData } = await supabase
          .from('player_progress')
          .select('crafting_materials')
          .eq('user_id', userId)
          .single();
        
        if (currentData) {
          await supabase
            .from('player_progress')
            .update({ crafting_materials: currentData.crafting_materials + rewardAmount })
            .eq('user_id', userId);
        }
        toast.success(`Claimed ${rewardAmount} materials!`);
      } else if (rewardType === 'cosmetic' && rewardCosmetic) {
        toast.success(`Claimed ${rewardCosmetic}!`);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  const purchasePremium = async () => {
    if (!userId || !activeSeason || !userProgress) return;

    if (userProgress.has_premium) {
      toast.error('Premium already purchased');
      return;
    }

    try {
      // Check if user has enough premium currency (cost: 500 gems)
      const { data: progressData } = await supabase
        .from('player_progress')
        .select('premium_currency')
        .eq('user_id', userId)
        .single();

      if (!progressData || progressData.premium_currency < 500) {
        toast.error('Not enough gems (requires 500)');
        return;
      }

      // Deduct currency and grant premium
      await supabase
        .from('player_progress')
        .update({ premium_currency: progressData.premium_currency - 500 })
        .eq('user_id', userId);

      const { data, error } = await supabase
        .from('user_battle_pass_progress')
        .update({ has_premium: true })
        .eq('user_id', userId)
        .eq('season_id', activeSeason.id)
        .select()
        .single();

      if (error) throw error;
      setUserProgress(data);
      toast.success('Premium Battle Pass purchased!');
    } catch (error) {
      console.error('Error purchasing premium:', error);
      toast.error('Failed to purchase premium');
    }
  };

  return {
    activeSeason,
    tiers,
    userProgress,
    loading,
    addXP,
    claimReward,
    purchasePremium
  };
};
