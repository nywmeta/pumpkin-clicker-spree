-- Create battle pass seasons table
CREATE TABLE public.battle_pass_seasons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_number integer NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create battle pass tiers table
CREATE TABLE public.battle_pass_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id uuid NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  tier_number integer NOT NULL,
  xp_required integer NOT NULL,
  free_reward_type text NOT NULL, -- 'currency', 'premium_currency', 'cosmetic', 'material'
  free_reward_amount integer,
  free_reward_cosmetic text,
  premium_reward_type text,
  premium_reward_amount integer,
  premium_reward_cosmetic text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(season_id, tier_number)
);

-- Create user battle pass progress table
CREATE TABLE public.user_battle_pass_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  season_id uuid NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  current_tier integer NOT NULL DEFAULT 1,
  current_xp integer NOT NULL DEFAULT 0,
  has_premium boolean NOT NULL DEFAULT false,
  claimed_free_tiers integer[] NOT NULL DEFAULT '{}',
  claimed_premium_tiers integer[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- Create seasonal challenges table
CREATE TABLE public.seasonal_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id uuid NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  challenge_key text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  requirement integer NOT NULL,
  xp_reward integer NOT NULL,
  difficulty text NOT NULL, -- 'easy', 'medium', 'hard', 'legendary'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(season_id, challenge_key)
);

-- Create user seasonal challenges progress table
CREATE TABLE public.user_seasonal_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  season_id uuid NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  challenge_key text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id, challenge_key)
);

-- Enable RLS
ALTER TABLE public.battle_pass_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_battle_pass_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_seasonal_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active seasons"
  ON public.battle_pass_seasons FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view battle pass tiers"
  ON public.battle_pass_tiers FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own battle pass progress"
  ON public.user_battle_pass_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own battle pass progress"
  ON public.user_battle_pass_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own battle pass progress"
  ON public.user_battle_pass_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view seasonal challenges"
  ON public.seasonal_challenges FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own challenge progress"
  ON public.user_seasonal_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
  ON public.user_seasonal_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON public.user_seasonal_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_battle_pass_seasons_active ON public.battle_pass_seasons(is_active);
CREATE INDEX idx_battle_pass_tiers_season ON public.battle_pass_tiers(season_id);
CREATE INDEX idx_user_battle_pass_progress_user ON public.user_battle_pass_progress(user_id);
CREATE INDEX idx_user_battle_pass_progress_season ON public.user_battle_pass_progress(season_id);
CREATE INDEX idx_seasonal_challenges_season ON public.seasonal_challenges(season_id);
CREATE INDEX idx_user_seasonal_challenges_user ON public.user_seasonal_challenges(user_id);
CREATE INDEX idx_user_seasonal_challenges_season ON public.user_seasonal_challenges(season_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_battle_pass_progress_updated_at
  BEFORE UPDATE ON public.user_battle_pass_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_seasonal_challenges_updated_at
  BEFORE UPDATE ON public.user_seasonal_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert a sample season
INSERT INTO public.battle_pass_seasons (season_number, name, description, start_date, end_date, is_active)
VALUES (
  1,
  'Season 1: Origins',
  'The first season of epic battles and legendary rewards!',
  now(),
  now() + interval '90 days',
  true
);

-- Insert sample battle pass tiers for season 1
WITH season AS (SELECT id FROM public.battle_pass_seasons WHERE season_number = 1)
INSERT INTO public.battle_pass_tiers (season_id, tier_number, xp_required, free_reward_type, free_reward_amount, premium_reward_type, premium_reward_amount, premium_reward_cosmetic)
SELECT 
  season.id,
  tier,
  tier * 100,
  CASE 
    WHEN tier % 5 = 0 THEN 'premium_currency'
    ELSE 'currency'
  END,
  CASE 
    WHEN tier % 5 = 0 THEN 10
    ELSE tier * 50
  END,
  CASE 
    WHEN tier % 10 = 0 THEN 'cosmetic'
    WHEN tier % 5 = 0 THEN 'premium_currency'
    ELSE 'material'
  END,
  CASE 
    WHEN tier % 10 = 0 THEN NULL
    WHEN tier % 5 = 0 THEN tier * 5
    ELSE tier * 10
  END,
  CASE 
    WHEN tier % 10 = 0 THEN 'Season 1 Tier ' || tier || ' Cosmetic'
    ELSE NULL
  END
FROM season, generate_series(1, 50) AS tier;

-- Insert sample seasonal challenges
WITH season AS (SELECT id FROM public.battle_pass_seasons WHERE season_number = 1)
INSERT INTO public.seasonal_challenges (season_id, challenge_key, name, description, category, requirement, xp_reward, difficulty)
SELECT 
  season.id,
  challenge_key,
  name,
  description,
  category,
  requirement,
  xp_reward,
  difficulty
FROM season, (VALUES
  ('season1_damage_10k', 'Deal 10,000 Damage', 'Deal a total of 10,000 damage this season', 'combat', 10000, 100, 'easy'),
  ('season1_damage_100k', 'Deal 100,000 Damage', 'Deal a total of 100,000 damage this season', 'combat', 100000, 500, 'medium'),
  ('season1_damage_1m', 'Deal 1,000,000 Damage', 'Deal a total of 1,000,000 damage this season', 'combat', 1000000, 2000, 'hard'),
  ('season1_stages_10', 'Complete 10 Stages', 'Complete 10 stages this season', 'progression', 10, 200, 'easy'),
  ('season1_stages_25', 'Complete 25 Stages', 'Complete 25 stages this season', 'progression', 25, 800, 'medium'),
  ('season1_bosses_10', 'Defeat 10 Bosses', 'Defeat 10 bosses this season', 'combat', 10, 300, 'medium'),
  ('season1_raid_participation', 'Participate in Raids', 'Deal damage to 5 raid bosses', 'raid', 5, 400, 'medium'),
  ('season1_raid_damage_100k', 'Raid Damage Master', 'Deal 100,000 total damage to raid bosses', 'raid', 100000, 1000, 'hard'),
  ('season1_crafts_20', 'Craft 20 Weapons', 'Craft 20 weapons this season', 'crafting', 20, 500, 'medium'),
  ('season1_legendary_craft', 'Craft Legendary', 'Craft a legendary or higher weapon', 'crafting', 1, 1500, 'legendary')
) AS challenges(challenge_key, name, description, category, requirement, xp_reward, difficulty);