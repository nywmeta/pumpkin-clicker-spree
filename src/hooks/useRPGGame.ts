import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Enemy, PlayerProgress, BossAttack, Upgrade } from "@/types/game";
import { toast } from "sonner";

const ENEMY_TYPES = [
  { name: "Pumpkin Minion", healthMultiplier: 1, currencyMultiplier: 1 },
  { name: "Scarecrow", healthMultiplier: 1.5, currencyMultiplier: 1.2 },
  { name: "Autumn Spirit", healthMultiplier: 2, currencyMultiplier: 1.5 },
];

const UPGRADES: Upgrade[] = [
  {
    id: "click-damage-1",
    name: "Sharp Claws",
    description: "Increases damage per click",
    baseCost: 10,
    costMultiplier: 1.15,
    damageIncrease: 1,
    owned: 0,
  },
  {
    id: "click-damage-2",
    name: "Steel Blade",
    description: "Significantly increases damage",
    baseCost: 100,
    costMultiplier: 1.2,
    damageIncrease: 10,
    owned: 0,
  },
  {
    id: "click-damage-3",
    name: "Demon Sword",
    description: "Massive damage boost",
    baseCost: 1000,
    costMultiplier: 1.25,
    damageIncrease: 50,
    owned: 0,
  },
];

const generateBossAttacks = (level: number): BossAttack[] => {
  const directions: Array<'down' | 'down-left' | 'down-right'> = ['down', 'down-left', 'down-right'];
  const numAttacks = Math.min(3 + Math.floor(level / 20), 7);
  
  return Array.from({ length: numAttacks }, (_, i) => ({
    id: `attack-${i}`,
    direction: directions[Math.floor(Math.random() * directions.length)],
    damage: Math.floor(level * 2),
    dodgeWindow: Math.max(1500 - level * 10, 800),
  }));
};

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
    attackPattern: isBoss ? generateBossAttacks(level) : undefined,
  };
};

export const useRPGGame = (userId: string | undefined) => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(UPGRADES);
  const [currentAttack, setCurrentAttack] = useState<BossAttack | null>(null);
  const [attackIndex, setAttackIndex] = useState(0);

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
        
        // Load owned upgrades from database
        if (data.upgrades) {
          const ownedUpgrades = typeof data.upgrades === 'string' 
            ? JSON.parse(data.upgrades) 
            : data.upgrades;
          
          setUpgrades(UPGRADES.map(u => ({
            ...u,
            owned: ownedUpgrades[u.id] || 0,
          })));
        }
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

  // Purchase upgrade
  const purchaseUpgrade = useCallback((upgradeId: string) => {
    if (!progress) return;

    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned));
    if (progress.currency < cost) {
      toast.error("Not enough currency!");
      return;
    }

    const newUpgrades = upgrades.map(u => 
      u.id === upgradeId ? { ...u, owned: u.owned + 1 } : u
    );
    setUpgrades(newUpgrades);

    const upgradesData = newUpgrades.reduce((acc, u) => {
      acc[u.id] = u.owned;
      return acc;
    }, {} as Record<string, number>);

    const totalDamage = progress.damage_per_click + upgrade.damageIncrease;
    const newProgress = {
      ...progress,
      currency: progress.currency - cost,
      damage_per_click: totalDamage,
      attack_damage: progress.attack_damage + upgrade.damageIncrease,
      upgrades: upgradesData,
    };

    setProgress(newProgress);
    saveProgress(newProgress);
    toast.success(`Purchased ${upgrade.name}!`);
  }, [progress, upgrades, saveProgress]);

  // Trigger boss attack
  useEffect(() => {
    if (!currentEnemy?.isBoss || !currentEnemy.attackPattern || currentAttack) return;

    const pattern = currentEnemy.attackPattern;
    if (attackIndex >= pattern.length) return;

    const timer = setTimeout(() => {
      setCurrentAttack(pattern[attackIndex]);
    }, 3000 + attackIndex * 5000);

    return () => clearTimeout(timer);
  }, [currentEnemy, attackIndex, currentAttack]);

  // Handle dodge
  const handleDodge = useCallback((direction: 'down' | 'down-left' | 'down-right') => {
    if (!currentAttack || !progress) return;

    if (direction === currentAttack.direction) {
      toast.success("Dodged!");
      setCurrentAttack(null);
      setAttackIndex(prev => prev + 1);
    } else {
      toast.error(`Wrong direction! -${currentAttack.damage} HP`);
      setCurrentAttack(null);
      setAttackIndex(prev => prev + 1);
    }
  }, [currentAttack, progress]);

  // Handle dodge timeout
  const handleDodgeTimeout = useCallback(() => {
    if (!currentAttack) return;
    toast.error(`Hit! -${currentAttack.damage} HP`);
    setCurrentAttack(null);
    setAttackIndex(prev => prev + 1);
  }, [currentAttack]);

  // Attack enemy
  const attackEnemy = useCallback(() => {
    if (!currentEnemy || !progress || currentAttack) return;

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
      setAttackIndex(0);
      setCurrentAttack(null);
      
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
    upgrades,
    purchaseUpgrade,
    currentAttack,
    handleDodge,
    handleDodgeTimeout,
  };
};