import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RaidBoss {
  id: string;
  boss_name: string;
  max_health: number;
  current_health: number;
  stage_level: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  defeated_at: string | null;
}

interface RaidContribution {
  id: string;
  raid_boss_id: string;
  user_id: string;
  damage_dealt: number;
}

export const useRaidBoss = (userId: string | undefined, playerDamage: number) => {
  const [activeRaidBoss, setActiveRaidBoss] = useState<RaidBoss | null>(null);
  const [myContribution, setMyContribution] = useState<RaidContribution | null>(null);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load active raid boss
  const loadActiveRaidBoss = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('raid_bosses')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading raid boss:', error);
        return;
      }

      setActiveRaidBoss(data);
      
      if (data && userId) {
        // Load my contribution
        const { data: contribution } = await supabase
          .from('raid_contributions')
          .select('*')
          .eq('raid_boss_id', data.id)
          .eq('user_id', userId)
          .single();

        setMyContribution(contribution);

        // Load top contributors
        const { data: contributors } = await supabase
          .from('raid_contributions')
          .select('*, profiles(username)')
          .eq('raid_boss_id', data.id)
          .order('damage_dealt', { ascending: false })
          .limit(10);

        setTopContributors(contributors || []);
      }
    } catch (error) {
      console.error('Error in loadActiveRaidBoss:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Attack raid boss
  const attackRaidBoss = useCallback(async () => {
    if (!activeRaidBoss || !userId) return;

    try {
      const damage = playerDamage;

      // Update or insert contribution
      const { error: upsertError } = await supabase
        .from('raid_contributions')
        .upsert({
          raid_boss_id: activeRaidBoss.id,
          user_id: userId,
          damage_dealt: (myContribution?.damage_dealt || 0) + damage,
        }, {
          onConflict: 'raid_boss_id,user_id'
        });

      if (upsertError) {
        console.error('Error updating contribution:', upsertError);
        return;
      }

      // Update raid boss health
      const newHealth = Math.max(0, activeRaidBoss.current_health - damage);
      
      const updateData: any = {
        current_health: newHealth,
      };

      // If defeated, mark as inactive
      if (newHealth === 0) {
        updateData.is_active = false;
        updateData.defeated_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('raid_bosses')
        .update(updateData)
        .eq('id', activeRaidBoss.id);

      if (updateError) {
        console.error('Error updating raid boss:', updateError);
        return;
      }

      if (newHealth === 0) {
        toast.success('🎉 Raid Boss Defeated!', {
          description: 'You and other players defeated the raid boss!'
        });
      }
    } catch (error) {
      console.error('Error attacking raid boss:', error);
    }
  }, [activeRaidBoss, userId, playerDamage, myContribution]);

  // Subscribe to raid boss updates
  useEffect(() => {
    loadActiveRaidBoss();

    const channel = supabase
      .channel('raid-boss-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'raid_bosses',
        },
        (payload) => {
          console.log('Raid boss update:', payload);
          loadActiveRaidBoss();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'raid_contributions',
        },
        () => {
          loadActiveRaidBoss();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadActiveRaidBoss]);

  return {
    activeRaidBoss,
    myContribution,
    topContributors,
    isLoading,
    attackRaidBoss,
    refreshRaidBoss: loadActiveRaidBoss,
  };
};
