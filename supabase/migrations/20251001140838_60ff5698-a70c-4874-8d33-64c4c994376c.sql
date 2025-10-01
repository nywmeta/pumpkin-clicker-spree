-- Create rarity enum (10 tiers)
CREATE TYPE public.rarity_tier AS ENUM (
  'gray',
  'light_blue',
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'violet',
  'black'
);

-- Create functional inventory table
CREATE TABLE public.functional_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'weapon', 'upgrade'
  item_name TEXT NOT NULL,
  rarity rarity_tier NOT NULL,
  damage_bonus INTEGER NOT NULL DEFAULT 0,
  materials INTEGER NOT NULL DEFAULT 0, -- salvage value
  equipped BOOLEAN NOT NULL DEFAULT false,
  slot TEXT, -- 'left_hand', 'right_hand', null for upgrades
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.functional_inventory ENABLE ROW LEVEL SECURITY;

-- RLS policies for functional_inventory
CREATE POLICY "Users can view their own inventory"
ON public.functional_inventory FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own inventory"
ON public.functional_inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
ON public.functional_inventory FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own inventory"
ON public.functional_inventory FOR DELETE
USING (auth.uid() = user_id);

-- Add crafting materials to player_progress
ALTER TABLE public.player_progress
ADD COLUMN crafting_materials INTEGER NOT NULL DEFAULT 0;