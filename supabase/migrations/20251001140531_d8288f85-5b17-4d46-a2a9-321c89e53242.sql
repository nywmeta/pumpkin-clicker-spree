-- Add weapon slots and attack damage to player_progress
ALTER TABLE public.player_progress 
ADD COLUMN left_hand_weapon TEXT DEFAULT NULL,
ADD COLUMN right_hand_weapon TEXT DEFAULT NULL,
ADD COLUMN attack_damage INTEGER NOT NULL DEFAULT 0;

-- Add comment explaining the columns
COMMENT ON COLUMN public.player_progress.left_hand_weapon IS 'ID of equipped weapon in left hand slot';
COMMENT ON COLUMN public.player_progress.right_hand_weapon IS 'ID of equipped weapon in right hand slot';
COMMENT ON COLUMN public.player_progress.attack_damage IS 'Bonus damage from upgrades, separate from base damage_per_click';