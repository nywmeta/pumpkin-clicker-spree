-- Create friends table
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create guilds table
CREATE TABLE public.guilds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  total_members INTEGER NOT NULL DEFAULT 1,
  max_members INTEGER NOT NULL DEFAULT 50,
  total_damage BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guild members table
CREATE TABLE public.guild_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
  contribution_damage BIGINT NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('global', 'guild', 'private')),
  guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_username TEXT NOT NULL,
  recipient_id UUID,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gifts table
CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  gift_type TEXT NOT NULL CHECK (gift_type IN ('currency', 'premium_currency', 'materials', 'item')),
  amount INTEGER,
  item_id UUID REFERENCES public.functional_inventory(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'returned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  CHECK (sender_id != recipient_id)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their own friendships"
ON public.friends FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
ON public.friends FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships"
ON public.friends FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships"
ON public.friends FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Guilds policies
CREATE POLICY "Anyone can view guilds"
ON public.guilds FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create guilds"
ON public.guilds FOR INSERT
WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Guild leaders can update their guild"
ON public.guilds FOR UPDATE
USING (auth.uid() = leader_id);

CREATE POLICY "Guild leaders can delete their guild"
ON public.guilds FOR DELETE
USING (auth.uid() = leader_id);

-- Guild members policies
CREATE POLICY "Anyone can view guild members"
ON public.guild_members FOR SELECT
USING (true);

CREATE POLICY "Users can join guilds"
ON public.guild_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guild officers can update members"
ON public.guild_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = guild_members.guild_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('leader', 'officer')
  )
);

CREATE POLICY "Users can leave guilds"
ON public.guild_members FOR DELETE
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.guild_members gm
  WHERE gm.guild_id = guild_members.guild_id
  AND gm.user_id = auth.uid()
  AND gm.role IN ('leader', 'officer')
));

-- Chat messages policies
CREATE POLICY "Users can view global messages"
ON public.chat_messages FOR SELECT
USING (channel_type = 'global');

CREATE POLICY "Guild members can view guild messages"
ON public.chat_messages FOR SELECT
USING (
  channel_type = 'guild' AND EXISTS (
    SELECT 1 FROM public.guild_members gm
    WHERE gm.guild_id = chat_messages.guild_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their private messages"
ON public.chat_messages FOR SELECT
USING (
  channel_type = 'private' AND 
  (auth.uid() = sender_id OR auth.uid() = recipient_id)
);

CREATE POLICY "Users can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Gifts policies
CREATE POLICY "Users can view their own gifts"
ON public.gifts FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send gifts"
ON public.gifts FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update gift status"
ON public.gifts FOR UPDATE
USING (auth.uid() = recipient_id);

-- Add indexes for performance
CREATE INDEX idx_friends_user_id ON public.friends(user_id);
CREATE INDEX idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX idx_friends_status ON public.friends(status);
CREATE INDEX idx_guilds_leader_id ON public.guilds(leader_id);
CREATE INDEX idx_guild_members_guild_id ON public.guild_members(guild_id);
CREATE INDEX idx_guild_members_user_id ON public.guild_members(user_id);
CREATE INDEX idx_chat_messages_channel ON public.chat_messages(channel_type, guild_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX idx_gifts_recipient ON public.gifts(recipient_id, status);

-- Add triggers for timestamps
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_guilds_updated_at
BEFORE UPDATE ON public.guilds
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for chat and presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_members;