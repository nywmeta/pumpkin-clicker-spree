-- Drop the old view
DROP VIEW IF EXISTS public.leaderboard;

-- Create leaderboard view with SECURITY INVOKER
CREATE OR REPLACE VIEW public.leaderboard 
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  pr.username,
  p.current_stage,
  p.current_level,
  p.prestige_level,
  p.damage_per_click,
  (p.current_stage * 100 + p.current_level + p.prestige_level * 1000) as total_score,
  p.updated_at
FROM public.player_progress p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
ORDER BY total_score DESC
LIMIT 100;