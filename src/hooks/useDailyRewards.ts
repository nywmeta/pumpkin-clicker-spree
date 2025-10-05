import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DailyReward {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_claim_date?: string;
  total_claims: number;
}

const DAILY_REWARDS = [
  { day: 1, currency: 100, premium: 1 },
  { day: 2, currency: 150, premium: 1 },
  { day: 3, currency: 200, premium: 2 },
  { day: 4, currency: 300, premium: 2 },
  { day: 5, currency: 500, premium: 3 },
  { day: 6, currency: 750, premium: 4 },
  { day: 7, currency: 1000, premium: 10 },
];

export const useDailyRewards = (userId: string | undefined) => {
  const [dailyReward, setDailyReward] = useState<DailyReward | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    loadDailyReward();
  }, [userId]);

  const loadDailyReward = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create initial record
        const { data: newData, error: insertError } = await supabase
          .from('daily_rewards')
          .insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            total_claims: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setDailyReward(newData);
        setCanClaim(true);
      } else {
        setDailyReward(data);
        checkCanClaim(data);
      }
    } catch (error) {
      console.error('Error loading daily reward:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanClaim = (reward: DailyReward) => {
    if (!reward.last_claim_date) {
      setCanClaim(true);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastClaim = reward.last_claim_date;

    setCanClaim(today !== lastClaim);
  };

  const claimDailyReward = async () => {
    if (!userId || !dailyReward || !canClaim) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      
      if (dailyReward.last_claim_date === yesterdayStr) {
        // Consecutive day
        newStreak = dailyReward.current_streak + 1;
      } else if (dailyReward.last_claim_date && dailyReward.last_claim_date !== today) {
        // Streak broken
        newStreak = 1;
      }

      // Get reward for current streak day (cycles every 7 days)
      const rewardDay = ((newStreak - 1) % 7) + 1;
      const reward = DAILY_REWARDS.find(r => r.day === rewardDay) || DAILY_REWARDS[0];

      // Update daily reward record
      const { error: updateError } = await supabase
        .from('daily_rewards')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, dailyReward.longest_streak),
          last_claim_date: today,
          total_claims: dailyReward.total_claims + 1,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Award currency and premium currency
      const { data: progressData } = await supabase
        .from('player_progress')
        .select('currency, premium_currency')
        .eq('user_id', userId)
        .single();

      if (progressData) {
        await supabase
          .from('player_progress')
          .update({
            currency: (progressData.currency || 0) + reward.currency,
            premium_currency: (progressData.premium_currency || 0) + reward.premium,
          })
          .eq('user_id', userId);
      }

      toast.success(`Daily Reward Claimed! Day ${newStreak}`, {
        description: `+${reward.currency} Gold, +${reward.premium} Gems`,
      });

      await loadDailyReward();
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      toast.error('Failed to claim daily reward');
    }
  };

  const getCurrentReward = () => {
    if (!dailyReward) return DAILY_REWARDS[0];
    
    const nextDay = dailyReward.last_claim_date 
      ? dailyReward.current_streak + 1 
      : 1;
    const rewardDay = ((nextDay - 1) % 7) + 1;
    
    return DAILY_REWARDS.find(r => r.day === rewardDay) || DAILY_REWARDS[0];
  };

  return {
    dailyReward,
    canClaim,
    loading,
    claimDailyReward,
    getCurrentReward,
    DAILY_REWARDS,
  };
};
