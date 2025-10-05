import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Guild {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  level: number;
  total_members: number;
  max_members: number;
  total_damage: number;
  created_at: string;
}

interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: 'leader' | 'officer' | 'member';
  contribution_damage: number;
  joined_at: string;
  username?: string;
}

export const useGuilds = (userId: string | undefined) => {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    loadGuilds();
    loadMyGuild();
  }, [userId]);

  const loadGuilds = async () => {
    try {
      const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .order('total_damage', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGuilds(data || []);
    } catch (error) {
      console.error('Error loading guilds:', error);
    }
  };

  const loadMyGuild = async () => {
    if (!userId) return;

    try {
      // Check if user is in a guild
      const { data: memberData, error: memberError } = await supabase
        .from('guild_members')
        .select('guild_id, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) throw memberError;

      if (memberData) {
        // Load guild details
        const { data: guildData, error: guildError } = await supabase
          .from('guilds')
          .select('*')
          .eq('id', memberData.guild_id)
          .single();

        if (guildError) throw guildError;
        setMyGuild(guildData);

        // Load guild members
        await loadGuildMembers(memberData.guild_id);
      } else {
        setMyGuild(null);
        setGuildMembers([]);
      }
    } catch (error) {
      console.error('Error loading my guild:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuildMembers = async (guildId: string) => {
    try {
      const { data: members, error: membersError } = await supabase
        .from('guild_members')
        .select('*')
        .eq('guild_id', guildId)
        .order('contribution_damage', { ascending: false });

      if (membersError) throw membersError;

      // Get usernames
      if (members && members.length > 0) {
        const userIds = members.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

        setGuildMembers(members.map(m => ({
          ...m,
          role: m.role as 'leader' | 'officer' | 'member',
          username: profileMap.get(m.user_id) || 'Unknown'
        })));
      } else {
        setGuildMembers([]);
      }
    } catch (error) {
      console.error('Error loading guild members:', error);
    }
  };

  const createGuild = async (name: string, description: string) => {
    if (!userId) return;

    try {
      // Check if user is already in a guild
      if (myGuild) {
        toast.error('You are already in a guild');
        return;
      }

      // Create guild
      const { data: guildData, error: guildError } = await supabase
        .from('guilds')
        .insert({
          name,
          description,
          leader_id: userId,
        })
        .select()
        .single();

      if (guildError) {
        if (guildError.code === '23505') {
          toast.error('Guild name already taken');
        } else {
          throw guildError;
        }
        return;
      }

      // Add creator as leader
      const { error: memberError } = await supabase
        .from('guild_members')
        .insert({
          guild_id: guildData.id,
          user_id: userId,
          role: 'leader',
        });

      if (memberError) throw memberError;

      toast.success('Guild created successfully!');
      await loadMyGuild();
      await loadGuilds();
    } catch (error) {
      console.error('Error creating guild:', error);
      toast.error('Failed to create guild');
    }
  };

  const joinGuild = async (guildId: string) => {
    if (!userId) return;

    try {
      if (myGuild) {
        toast.error('You are already in a guild');
        return;
      }

      // Check if guild is full
      const guild = guilds.find(g => g.id === guildId);
      if (guild && guild.total_members >= guild.max_members) {
        toast.error('Guild is full');
        return;
      }

      const { error } = await supabase
        .from('guild_members')
        .insert({
          guild_id: guildId,
          user_id: userId,
        });

      if (error) throw error;

      // Update guild member count
      await supabase
        .from('guilds')
        .update({ total_members: (guild?.total_members || 0) + 1 })
        .eq('id', guildId);

      toast.success('Joined guild successfully!');
      await loadMyGuild();
      await loadGuilds();
    } catch (error) {
      console.error('Error joining guild:', error);
      toast.error('Failed to join guild');
    }
  };

  const leaveGuild = async () => {
    if (!userId || !myGuild) return;

    try {
      const { error } = await supabase
        .from('guild_members')
        .delete()
        .eq('guild_id', myGuild.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Update guild member count
      await supabase
        .from('guilds')
        .update({ total_members: myGuild.total_members - 1 })
        .eq('id', myGuild.id);

      toast.success('Left guild');
      await loadMyGuild();
      await loadGuilds();
    } catch (error) {
      console.error('Error leaving guild:', error);
      toast.error('Failed to leave guild');
    }
  };

  return {
    guilds,
    myGuild,
    guildMembers,
    loading,
    createGuild,
    joinGuild,
    leaveGuild,
    refreshGuilds: loadGuilds,
    refreshMyGuild: loadMyGuild,
  };
};
