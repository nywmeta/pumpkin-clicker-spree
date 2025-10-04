-- Add premium currency to player progress
ALTER TABLE public.player_progress
ADD COLUMN premium_currency INTEGER NOT NULL DEFAULT 0;

-- Create cosmetic items table
CREATE TABLE public.cosmetic_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cosmetic_type TEXT NOT NULL, -- 'skin', 'effect', 'frame', 'emote'
  cosmetic_name TEXT NOT NULL,
  rarity rarity_tier NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  equipped BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, cosmetic_name)
);

-- Create lootbox history table
CREATE TABLE public.lootbox_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  box_type TEXT NOT NULL, -- 'basic', 'premium', 'legendary'
  items_received JSONB NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cosmetic_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootbox_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cosmetic_inventory
CREATE POLICY "Users can view their own cosmetics"
ON public.cosmetic_inventory
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cosmetics"
ON public.cosmetic_inventory
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cosmetics"
ON public.cosmetic_inventory
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cosmetics"
ON public.cosmetic_inventory
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for lootbox_history
CREATE POLICY "Users can view their own lootbox history"
ON public.lootbox_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lootbox history"
ON public.lootbox_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_cosmetic_inventory_user ON public.cosmetic_inventory(user_id, equipped);
CREATE INDEX idx_lootbox_history_user ON public.lootbox_history(user_id, opened_at DESC);