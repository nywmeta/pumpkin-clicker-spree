import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Enemy, PlayerProgress } from "@/types/game";
import { toast } from "sonner";

const ENEMY_TYPES = [
  { name: "Pumpkin Minion", healthMultiplier: 1, currencyMultiplier: 1 },
  { name: "Scarecrow", healthMultiplier: 1.5, currencyMultiplier: 1.2 },
  { name: "Autumn Spirit", healthMultiplier: 2, currencyMultiplier: 1.5 },
];

const generateEnemy = (stage: number, level: number): Enemy => {
  const isBoss = level % 10 === 0;
  const enemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
  
  const baseHealth = 10 * Math.pow(1.15, level);
  const health = isBoss 
    ? baseHealth * 10 * enemyType.healthMultiplier
    : baseHealth * enemyType.healthMultiplier;
  
  const currency = isBoss
    ? Math.floor(level * 5 * enemyType.currencyMultiplier)
    : Math.floor(level * enemyType.currencyMultiplier);

  return {
    id: `${stage}-${level}`,
    name: isBoss ? `Boss ${enemyType.name}` : enemyType.name,
    health,
    maxHealth: health,
    damage: Math.floor(level * 0.5),
    currency,
    isBoss,
  };
};

export const useRPGGame = (userId: string | undefined) => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [loading, setLoading] = useState(true);

  // Load player progress
  useEffect(() => {
    if (!userId) return;

    const loadProgress = async () => {
      const { data, error } = await supabase
        .from("player_progress")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error loading progress:", error);
        return;
      }

      if (data) {
        setProgress(data);
        setCurrentEnemy(generateEnemy(data.current_stage, data.current_level));
      }
      setLoading(false);
    };

    loadProgress();
  }, [userId]);

  // Save progress to database
  const saveProgress = useCallback(async (updates: Partial<PlayerProgress>) => {
    if (!userId || !progress) return;

    const { error } = await supabase
      .from("player_progress")
      .update(updates)
      .eq("user_id", userId);

    if (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    }
  }, [userId, progress]);

  // Attack enemy
  const attackEnemy = useCallback(() => {
    if (!currentEnemy || !progress) return;

    const newHealth = Math.max(0, currentEnemy.health - progress.damage_per_click);
    
    if (newHealth === 0) {
      // Enemy defeated
      const newCurrency = progress.currency + currentEnemy.currency;
      let newLevel = progress.current_level;
      let newStage = progress.current_stage;

      // Level progression
      if (progress.current_level < 69) {
        newLevel = progress.current_level + 1;
      } else {
        newLevel = 1;
        newStage = progress.current_stage + 1;
      }

      const newProgress = {
        ...progress,
        current_level: newLevel,
        current_stage: newStage,
        currency: newCurrency,
      };

      setProgress(newProgress);
      saveProgress(newProgress);
      setCurrentEnemy(generateEnemy(newStage, newLevel));
      
      if (currentEnemy.isBoss) {
        toast.success(`Boss defeated! +${currentEnemy.currency} currency`);
      }
    } else {
      setCurrentEnemy({ ...currentEnemy, health: newHealth });
    }
  }, [currentEnemy, progress, saveProgress]);

  return {
    progress,
    currentEnemy,
    loading,
    attackEnemy,
  };
};