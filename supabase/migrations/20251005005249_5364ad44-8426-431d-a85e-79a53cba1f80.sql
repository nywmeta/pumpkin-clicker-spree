-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,
  requirement INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_key TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

-- Create daily rewards table
CREATE TABLE public.daily_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_claim_date DATE,
  total_claims INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements FOR UPDATE
USING (auth.uid() = user_id);

-- Daily rewards policies
CREATE POLICY "Users can view their own daily rewards"
ON public.daily_rewards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily rewards"
ON public.daily_rewards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily rewards"
ON public.daily_rewards FOR UPDATE
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON public.user_achievements(completed);
CREATE INDEX idx_daily_rewards_user_id ON public.daily_rewards(user_id);

-- Insert starter achievements
INSERT INTO public.achievements (achievement_key, name, description, category, tier, requirement, reward_type, reward_amount) VALUES
  -- Damage achievements
  ('damage_1k', 'Beginner Warrior', 'Deal 1,000 total damage', 'damage', 1, 1000, 'currency', 100),
  ('damage_10k', 'Seasoned Fighter', 'Deal 10,000 total damage', 'damage', 2, 10000, 'currency', 500),
  ('damage_100k', 'Combat Master', 'Deal 100,000 total damage', 'damage', 3, 100000, 'currency', 2000),
  ('damage_1m', 'Legendary Warrior', 'Deal 1,000,000 total damage', 'damage', 4, 1000000, 'premium_currency', 10),
  
  -- Stage achievements
  ('stage_5', 'Explorer', 'Reach Stage 5', 'progression', 1, 5, 'currency', 200),
  ('stage_10', 'Adventurer', 'Reach Stage 10', 'progression', 2, 10, 'currency', 1000),
  ('stage_25', 'Conqueror', 'Reach Stage 25', 'progression', 3, 25, 'premium_currency', 5),
  ('stage_50', 'World Traveler', 'Reach Stage 50', 'progression', 4, 50, 'premium_currency', 20),
  
  -- Click achievements
  ('clicks_100', 'Clicker Novice', 'Click 100 times', 'engagement', 1, 100, 'currency', 50),
  ('clicks_1000', 'Clicker Expert', 'Click 1,000 times', 'engagement', 2, 1000, 'currency', 500),
  ('clicks_10000', 'Clicker Master', 'Click 10,000 times', 'engagement', 3, 10000, 'premium_currency', 5),
  
  -- Raid boss achievements
  ('raid_damage_10k', 'Raid Contributor', 'Deal 10,000 damage to raid bosses', 'raid', 1, 10000, 'currency', 1000),
  ('raid_damage_100k', 'Raid Hero', 'Deal 100,000 damage to raid bosses', 'raid', 2, 100000, 'premium_currency', 10),
  
  -- Prestige achievements
  ('prestige_1', 'Reborn', 'Prestige for the first time', 'prestige', 1, 1, 'premium_currency', 10),
  ('prestige_5', 'Ascended', 'Prestige 5 times', 'prestige', 2, 5, 'premium_currency', 25),
  ('prestige_10', 'Transcendent', 'Prestige 10 times', 'prestige', 3, 10, 'premium_currency', 50),
  
  -- Collection achievements
  ('weapons_10', 'Collector', 'Own 10 weapons', 'collection', 1, 10, 'currency', 500),
  ('weapons_50', 'Hoarder', 'Own 50 weapons', 'collection', 2, 50, 'premium_currency', 15),
  ('legendary_weapon', 'Legendary Hunter', 'Obtain a Legendary or higher rarity weapon', 'collection', 3, 1, 'premium_currency', 20);

-- Trigger for updating user_achievements timestamp
CREATE TRIGGER update_user_achievements_updated_at
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updating daily_rewards timestamp
CREATE TRIGGER update_daily_rewards_updated_at
BEFORE UPDATE ON public.daily_rewards
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();