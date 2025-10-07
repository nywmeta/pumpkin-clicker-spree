import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  requirement: number;
  reward_type: string;
  reward_amount: number;
  icon?: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  claimed: boolean;
}

export const useAchievements = (userId: string | undefined) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    loadAchievements();
    loadUserAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('tier', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadUserAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error loading user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAchievementProgress = async (
    achievementKey: string,
    progress: number
  ) => {
    if (!userId) return;

    try {
      const achievement = achievements.find(a => a.achievement_key === achievementKey);
      if (!achievement) return;

      const userAchievement = userAchievements.find(
        ua => ua.achievement_key === achievementKey
      );

      const completed = progress >= achievement.requirement;

      // Use upsert to avoid duplicate key errors
      const wasCompleted = userAchievement?.completed || false;
      
      const { error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_key: achievementKey,
          progress,
          completed,
          completed_at: completed && !wasCompleted ? new Date().toISOString() : userAchievement?.completed_at,
        }, {
          onConflict: 'user_id,achievement_key',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Show notification if just completed
      if (completed && !wasCompleted) {
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `Claim your reward: ${achievement.reward_amount} ${achievement.reward_type === 'premium_currency' ? 'Gems' : 'Gold'}`,
        });
      }

      await loadUserAchievements();
    } catch (error) {
      console.error('Error updating achievement:', error);
    }
  };

  const claimAchievementReward = async (achievementKey: string) => {
    if (!userId) return;

    try {
      const achievement = achievements.find(a => a.achievement_key === achievementKey);
      const userAchievement = userAchievements.find(
        ua => ua.achievement_key === achievementKey
      );

      if (!achievement || !userAchievement || !userAchievement.completed || userAchievement.claimed) {
        return;
      }

      // Mark as claimed
      const { error: claimError } = await supabase
        .from('user_achievements')
        .update({ claimed: true })
        .eq('id', userAchievement.id);

      if (claimError) throw claimError;

      // Award the reward
      const updateField = achievement.reward_type === 'premium_currency' 
        ? 'premium_currency' 
        : 'currency';

      const { data: progressData } = await supabase
        .from('player_progress')
        .select(updateField)
        .eq('user_id', userId)
        .single();

      if (progressData) {
        await supabase
          .from('player_progress')
          .update({
            [updateField]: (progressData[updateField] || 0) + achievement.reward_amount,
          })
          .eq('user_id', userId);
      }

      toast.success(`Reward Claimed!`, {
        description: `+${achievement.reward_amount} ${achievement.reward_type === 'premium_currency' ? 'Gems' : 'Gold'}`,
      });

      await loadUserAchievements();
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast.error('Failed to claim reward');
    }
  };

  const getAchievementStatus = (achievementKey: string) => {
    const userAchievement = userAchievements.find(
      ua => ua.achievement_key === achievementKey
    );
    return userAchievement || null;
  };

  return {
    achievements,
    userAchievements,
    loading,
    updateAchievementProgress,
    claimAchievementReward,
    getAchievementStatus,
  };
};
