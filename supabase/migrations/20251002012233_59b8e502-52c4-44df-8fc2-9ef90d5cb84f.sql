-- Add prestige columns to player_progress
ALTER TABLE public.player_progress
ADD COLUMN prestige_level integer NOT NULL DEFAULT 0,
ADD COLUMN prestige_multiplier numeric NOT NULL DEFAULT 1.0;