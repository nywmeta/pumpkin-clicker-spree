import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_username?: string;
}

export const useFriends = (userId: string | undefined) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    loadFriends();
  }, [userId]);

  const loadFriends = async () => {
    if (!userId) return;

    try {
      // Get accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Get pending requests received
      const { data: pendingData, error: pendingError } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get usernames for all friends
      const allFriendIds = [
        ...(friendsData || []).map(f => f.user_id === userId ? f.friend_id : f.user_id),
        ...(pendingData || []).map(f => f.user_id)
      ];

      if (allFriendIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', allFriendIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

        setFriends((friendsData || []).map(f => ({
          ...f,
          status: f.status as 'accepted' | 'blocked' | 'pending',
          friend_username: profileMap.get(f.user_id === userId ? f.friend_id : f.user_id)
        })));

        setPendingRequests((pendingData || []).map(f => ({
          ...f,
          status: f.status as 'accepted' | 'blocked' | 'pending',
          friend_username: profileMap.get(f.user_id)
        })));
      } else {
        setFriends([]);
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendUsername: string) => {
    if (!userId) return;

    try {
      // Get friend ID from username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', friendUsername)
        .single();

      if (profileError || !profile) {
        toast.error('User not found');
        return;
      }

      if (profile.id === userId) {
        toast.error('Cannot add yourself as a friend');
        return;
      }

      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: profile.id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Friend request already exists');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Friend request sent!');
      await loadFriends();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Friend request accepted!');
      await loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend removed');
      await loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  return {
    friends,
    pendingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    refreshFriends: loadFriends,
  };
};
