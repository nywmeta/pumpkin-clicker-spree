-- Create raid bosses table for shared world bosses
CREATE TABLE public.raid_bosses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_name TEXT NOT NULL,
  max_health BIGINT NOT NULL,
  current_health BIGINT NOT NULL,
  stage_level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  defeated_at TIMESTAMP WITH TIME ZONE
);

-- Create raid contributions table to track player damage
CREATE TABLE public.raid_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_boss_id UUID NOT NULL REFERENCES public.raid_bosses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  damage_dealt BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(raid_boss_id, user_id)
);

-- Enable RLS
ALTER TABLE public.raid_bosses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raid_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raid_bosses (everyone can view active raids)
CREATE POLICY "Anyone can view active raid bosses"
ON public.raid_bosses
FOR SELECT
USING (is_active = true);

-- RLS Policies for raid_contributions (users can view all contributions and insert their own)
CREATE POLICY "Anyone can view raid contributions"
ON public.raid_contributions
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own contributions"
ON public.raid_contributions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions"
ON public.raid_contributions
FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for raid bosses
ALTER PUBLICATION supabase_realtime ADD TABLE public.raid_bosses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.raid_contributions;

-- Create index for better query performance
CREATE INDEX idx_raid_bosses_active ON public.raid_bosses(is_active, created_at DESC);
CREATE INDEX idx_raid_contributions_boss ON public.raid_contributions(raid_boss_id, damage_dealt DESC);