import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessage {
  id: string;
  channel_type: 'global' | 'guild' | 'private';
  guild_id?: string;
  sender_id: string;
  sender_username: string;
  recipient_id?: string;
  message: string;
  created_at: string;
}

export const useChat = (
  userId: string | undefined,
  channelType: 'global' | 'guild',
  guildId?: string
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    loadMessages();
    
    const channel = subscribeToMessages();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, channelType, guildId]);

  const loadMessages = async () => {
    if (!userId) return;

    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_type', channelType)
        .order('created_at', { ascending: true })
        .limit(100);

      if (channelType === 'guild' && guildId) {
        query = query.eq('guild_id', guildId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        channel_type: msg.channel_type as 'global' | 'guild' | 'private'
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = (): RealtimeChannel | null => {
    if (!userId) return null;

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: channelType === 'guild' && guildId 
            ? `channel_type=eq.${channelType},guild_id=eq.${guildId}`
            : `channel_type=eq.${channelType}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, {
            ...newMessage,
            channel_type: newMessage.channel_type as 'global' | 'guild' | 'private'
          }]);
        }
      )
      .subscribe();

    return channel;
  };

  const sendMessage = async (message: string, username: string) => {
    if (!userId || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          channel_type: channelType,
          guild_id: channelType === 'guild' ? guildId : null,
          sender_id: userId,
          sender_username: username,
          message: message.trim(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};
