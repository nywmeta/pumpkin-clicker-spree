import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Enemy, PlayerProgress, BossAttack, Upgrade, InventoryItem, RarityTier } from "@/types/game";
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

const RARITY_TIERS: RarityTier[] = ['gray', 'light_blue', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'violet', 'black'];

const generateLoot = (level: number, isBoss: boolean): { rarity: RarityTier; damageBonus: number; materials: number } => {
  const rarityChance = Math.random() * 100;
  let rarityIndex = 0;
  
  if (isBoss) {
    // Boss guaranteed drop with better rarity
    const bossBonus = Math.floor(level / 10);
    if (rarityChance > 95) rarityIndex = Math.min(9, 6 + bossBonus);
    else if (rarityChance > 85) rarityIndex = Math.min(9, 5 + bossBonus);
    else if (rarityChance > 70) rarityIndex = Math.min(9, 4 + bossBonus);
    else if (rarityChance > 50) rarityIndex = Math.min(9, 3 + bossBonus);
    else if (rarityChance > 30) rarityIndex = Math.min(9, 2 + bossBonus);
    else rarityIndex = Math.min(9, 1 + bossBonus);
  } else {
    return { rarity: 'gray', damageBonus: 0, materials: 0 }; // Non-bosses don't drop
  }
  
  const rarity = RARITY_TIERS[rarityIndex];
  const damageBonus = Math.floor(10 * Math.pow(1.5, rarityIndex) * (1 + level / 20));
  const materials = Math.floor(50 * Math.pow(1.5, rarityIndex));
  
  return { rarity, damageBonus, materials };
};

export const useRPGGame = (userId: string | undefined) => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(UPGRADES);
  const [currentAttack, setCurrentAttack] = useState<BossAttack | null>(null);
  const [attackIndex, setAttackIndex] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Load player progress and inventory
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
      
      // Load inventory
      const { data: inventoryData, error: invError } = await supabase
        .from("functional_inventory")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        
      if (!invError && inventoryData) {
        setInventory(inventoryData as InventoryItem[]);
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

  // Equip weapon
  const equipWeapon = useCallback(async (itemId: string, slot: 'left_hand' | 'right_hand') => {
    if (!userId || !progress) return;

    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // Unequip current weapon in slot
    const currentEquipped = inventory.find(i => i.equipped && i.slot === slot);
    if (currentEquipped) {
      await supabase
        .from("functional_inventory")
        .update({ equipped: false, slot: null })
        .eq("id", currentEquipped.id);
    }

    // Equip new weapon
    await supabase
      .from("functional_inventory")
      .update({ equipped: true, slot })
      .eq("id", itemId);

    // Calculate total damage from equipped weapons
    const newInventory = inventory.map(i => {
      if (i.id === itemId) return { ...i, equipped: true, slot };
      if (i.id === currentEquipped?.id) return { ...i, equipped: false, slot: null };
      return i;
    });
    
    const totalWeaponDamage = newInventory
      .filter(i => i.equipped && i.item_type === 'weapon')
      .reduce((sum, i) => sum + i.damage_bonus, 0);

    const newProgress = {
      ...progress,
      damage_per_click: progress.attack_damage + totalWeaponDamage + 1,
      left_hand_weapon: slot === 'left_hand' ? item.item_name : progress.left_hand_weapon,
      right_hand_weapon: slot === 'right_hand' ? item.item_name : progress.right_hand_weapon,
    };

    setProgress(newProgress);
    setInventory(newInventory);
    await saveProgress(newProgress);
    toast.success(`Equipped ${item.item_name} in ${slot.replace('_', ' ')}`);
  }, [inventory, userId, progress, saveProgress]);

  // Salvage item
  const salvageItem = useCallback(async (itemId: string) => {
    if (!userId || !progress) return;

    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    await supabase
      .from("functional_inventory")
      .delete()
      .eq("id", itemId);

    const newProgress = {
      ...progress,
      crafting_materials: progress.crafting_materials + item.materials,
    };

    setProgress(newProgress);
    setInventory(inventory.filter(i => i.id !== itemId));
    await saveProgress(newProgress);
    toast.success(`Salvaged for ${item.materials} materials`);
  }, [inventory, userId, progress, saveProgress]);

  // Craft weapon
  const craftWeapon = useCallback(async (rarityIndex: number) => {
    if (!userId || !progress) return;

    const cost = Math.floor(100 * Math.pow(2, rarityIndex));
    if (progress.crafting_materials < cost) {
      toast.error("Not enough materials!");
      return;
    }

    const rarity = RARITY_TIERS[rarityIndex];
    const damageBonus = Math.floor(10 * Math.pow(1.5, rarityIndex));
    const materials = Math.floor(50 * Math.pow(1.5, rarityIndex));

    const { data, error } = await supabase
      .from("functional_inventory")
      .insert({
        user_id: userId,
        item_type: 'weapon',
        item_name: `Crafted ${rarity} Blade`,
        rarity,
        damage_bonus: damageBonus,
        materials,
        equipped: false,
      })
      .select()
      .single();

    if (error || !data) {
      toast.error("Failed to craft weapon");
      return;
    }

    const newProgress = {
      ...progress,
      crafting_materials: progress.crafting_materials - cost,
    };

    setProgress(newProgress);
    setInventory([data as InventoryItem, ...inventory]);
    await saveProgress(newProgress);
    toast.success(`Crafted ${data.item_name}!`);
  }, [userId, progress, inventory, saveProgress]);

  // Attack enemy
  const attackEnemy = useCallback(async () => {
    if (!currentEnemy || !progress || currentAttack || !userId) return;

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
      await saveProgress(newProgress);
      setCurrentEnemy(generateEnemy(newStage, newLevel));
      setAttackIndex(0);
      setCurrentAttack(null);
      
      // Boss drops
      if (currentEnemy.isBoss) {
        const loot = generateLoot(progress.current_level, true);
        
        const { data: dropData } = await supabase
          .from("functional_inventory")
          .insert({
            user_id: userId,
            item_type: 'weapon',
            item_name: `${loot.rarity} Boss Drop`,
            rarity: loot.rarity,
            damage_bonus: loot.damageBonus,
            materials: loot.materials,
            equipped: false,
          })
          .select()
          .single();
          
        if (dropData) {
          setInventory([dropData as InventoryItem, ...inventory]);
          toast.success(`Boss defeated! +${currentEnemy.currency} currency + ${loot.rarity} drop!`);
        } else {
          toast.success(`Boss defeated! +${currentEnemy.currency} currency`);
        }
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
    inventory,
    equipWeapon,
    salvageItem,
    craftWeapon,
  };
};