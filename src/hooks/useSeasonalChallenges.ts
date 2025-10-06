import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  season_id: string;
  challenge_key: string;
  name: string;
  description: string;
  category: string;
  requirement: number;
  xp_reward: number;
  difficulty: string;
}

interface UserChallengeProgress {
  id: string;
  user_id: string;
  season_id: string;
  challenge_key: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

export const useSeasonalChallenges = (userId?: string, onXPEarned?: (xp: number) => void) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserChallengeProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [seasonId, setSeasonId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    loadChallenges();
  }, [userId]);

  const loadChallenges = async () => {
    if (!userId) return;

    try {
      // Get active season
      const { data: seasonData, error: seasonError } = await supabase
        .from('battle_pass_seasons')
        .select('id')
        .eq('is_active', true)
        .single();

      if (seasonError) throw seasonError;
      if (!seasonData) {
        setLoading(false);
        return;
      }

      setSeasonId(seasonData.id);

      // Load challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('seasonal_challenges')
        .select('*')
        .eq('season_id', seasonData.id);

      if (challengesError) throw challengesError;
      setChallenges(challengesData || []);

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_seasonal_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('season_id', seasonData.id);

      if (progressError) throw progressError;

      const progressMap = new Map<string, UserChallengeProgress>();
      (progressData || []).forEach(p => {
        progressMap.set(p.challenge_key, p);
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const updateChallengeProgress = async (challengeKey: string, progressAmount: number) => {
    if (!userId || !seasonId) return;

    try {
      const challenge = challenges.find(c => c.challenge_key === challengeKey);
      if (!challenge) return;

      const currentProgress = userProgress.get(challengeKey);
      
      if (currentProgress && currentProgress.completed) {
        return; // Already completed
      }

      const newProgress = (currentProgress?.progress || 0) + progressAmount;
      const isCompleted = newProgress >= challenge.requirement;

      if (!currentProgress) {
        // Create new progress entry
        const { data, error } = await supabase
          .from('user_seasonal_challenges')
          .insert({
            user_id: userId,
            season_id: seasonId,
            challenge_key: challengeKey,
            progress: newProgress,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (error) throw error;
        
        const newMap = new Map(userProgress);
        newMap.set(challengeKey, data);
        setUserProgress(newMap);

        if (isCompleted) {
          toast.success(`Challenge completed: ${challenge.name}`);
          if (onXPEarned) {
            onXPEarned(challenge.xp_reward);
          }
        }
      } else {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_seasonal_challenges')
          .update({
            progress: newProgress,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : currentProgress.completed_at
          })
          .eq('user_id', userId)
          .eq('season_id', seasonId)
          .eq('challenge_key', challengeKey)
          .select()
          .single();

        if (error) throw error;

        const newMap = new Map(userProgress);
        newMap.set(challengeKey, data);
        setUserProgress(newMap);

        if (isCompleted && !currentProgress.completed) {
          toast.success(`Challenge completed: ${challenge.name}`);
          if (onXPEarned) {
            onXPEarned(challenge.xp_reward);
          }
        }
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  return {
    challenges,
    userProgress,
    loading,
    updateChallengeProgress
  };
};
