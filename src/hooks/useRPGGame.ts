import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Enemy, PlayerProgress, BossAttack, Upgrade, InventoryItem, RarityTier } from "@/types/game";
import { toast } from "sonner";

const ENEMY_TYPES = [
  { name: "Pumpkin Grunt", healthMultiplier: 1, currencyMultiplier: 1, sprite: "pumpkin-monster-1" },
  { name: "Gourd Guardian", healthMultiplier: 1.3, currencyMultiplier: 1.1, sprite: "pumpkin-monster-2" },
  { name: "Vine Stalker", healthMultiplier: 1.5, currencyMultiplier: 1.2, sprite: "pumpkin-monster-3" },
  { name: "Jack's Wrath", healthMultiplier: 1.7, currencyMultiplier: 1.3, sprite: "pumpkin-monster-4" },
  { name: "Harvest Horror", healthMultiplier: 1.9, currencyMultiplier: 1.4, sprite: "pumpkin-monster-5" },
];

const UPGRADES: Upgrade[] = [
  // Basic Attack Upgrades
  {
    id: "click-damage-1",
    name: "Sharp Claws",
    description: "Your first weapon. Better than bare hands!",
    baseCost: 10,
    costMultiplier: 1.15,
    damageIncrease: 1,
    owned: 0,
    category: "attack",
    tier: "common",
  },
  {
    id: "click-damage-2",
    name: "Iron Sword",
    description: "A reliable blade for any adventurer",
    baseCost: 50,
    costMultiplier: 1.18,
    damageIncrease: 5,
    owned: 0,
    category: "attack",
    tier: "common",
  },
  {
    id: "click-damage-3",
    name: "Steel Blade",
    description: "Forged in dragon fire",
    baseCost: 200,
    costMultiplier: 1.2,
    damageIncrease: 15,
    owned: 0,
    category: "attack",
    tier: "uncommon",
  },
  {
    id: "click-damage-4",
    name: "Enchanted Katana",
    description: "Imbued with ancient magic",
    baseCost: 1000,
    costMultiplier: 1.22,
    damageIncrease: 50,
    owned: 0,
    category: "attack",
    tier: "rare",
  },
  {
    id: "click-damage-5",
    name: "Demon Slayer",
    description: "Feared by demons across all realms",
    baseCost: 5000,
    costMultiplier: 1.25,
    damageIncrease: 150,
    owned: 0,
    category: "attack",
    tier: "epic",
  },
  {
    id: "click-damage-6",
    name: "Void Reaver",
    description: "Cuts through reality itself",
    baseCost: 25000,
    costMultiplier: 1.28,
    damageIncrease: 500,
    owned: 0,
    category: "attack",
    tier: "legendary",
  },

  // Critical Hit Upgrades
  {
    id: "crit-1",
    name: "Lucky Charm",
    description: "Increases critical hit chance by 2%",
    baseCost: 150,
    costMultiplier: 1.3,
    damageIncrease: 5,
    owned: 0,
    category: "critical",
    tier: "common",
  },
  {
    id: "crit-2",
    name: "Precision Training",
    description: "Your strikes become more accurate (+5% crit)",
    baseCost: 800,
    costMultiplier: 1.35,
    damageIncrease: 20,
    owned: 0,
    category: "critical",
    tier: "uncommon",
  },
  {
    id: "crit-3",
    name: "Assassin's Focus",
    description: "Critical hits deal devastating damage (+10% crit)",
    baseCost: 4000,
    costMultiplier: 1.4,
    damageIncrease: 80,
    owned: 0,
    category: "critical",
    tier: "rare",
  },
  {
    id: "crit-4",
    name: "Deathblow Master",
    description: "Every strike has lethal potential (+15% crit)",
    baseCost: 20000,
    costMultiplier: 1.45,
    damageIncrease: 300,
    owned: 0,
    category: "critical",
    tier: "epic",
  },

  // Damage Over Time
  {
    id: "dot-1",
    name: "Poison Coating",
    description: "Enemies take damage over time",
    baseCost: 300,
    costMultiplier: 1.25,
    damageIncrease: 10,
    owned: 0,
    category: "magic",
    tier: "common",
  },
  {
    id: "dot-2",
    name: "Cursed Flame",
    description: "Burns enemies with dark fire",
    baseCost: 1500,
    costMultiplier: 1.3,
    damageIncrease: 40,
    owned: 0,
    category: "magic",
    tier: "uncommon",
  },
  {
    id: "dot-3",
    name: "Plague Touch",
    description: "Spreads corruption to your foes",
    baseCost: 7500,
    costMultiplier: 1.35,
    damageIncrease: 160,
    owned: 0,
    category: "magic",
    tier: "rare",
  },

  // Gold/Currency Bonuses
  {
    id: "gold-1",
    name: "Coin Magnet",
    description: "+10% gold from enemies",
    baseCost: 100,
    costMultiplier: 1.2,
    damageIncrease: 2,
    owned: 0,
    category: "utility",
    tier: "common",
  },
  {
    id: "gold-2",
    name: "Treasure Hunter",
    description: "+25% gold from enemies",
    baseCost: 500,
    costMultiplier: 1.25,
    damageIncrease: 8,
    owned: 0,
    category: "utility",
    tier: "uncommon",
  },
  {
    id: "gold-3",
    name: "Dragon's Hoard",
    description: "+50% gold from enemies",
    baseCost: 2500,
    costMultiplier: 1.3,
    damageIncrease: 30,
    owned: 0,
    category: "utility",
    tier: "rare",
  },
  {
    id: "gold-4",
    name: "Midas Touch",
    description: "+100% gold from enemies",
    baseCost: 15000,
    costMultiplier: 1.4,
    damageIncrease: 120,
    owned: 0,
    category: "utility",
    tier: "epic",
  },

  // Boss Damage
  {
    id: "boss-1",
    name: "Giant Slayer",
    description: "+20% damage to bosses",
    baseCost: 600,
    costMultiplier: 1.3,
    damageIncrease: 15,
    owned: 0,
    category: "special",
    tier: "uncommon",
  },
  {
    id: "boss-2",
    name: "Titan Crusher",
    description: "+50% damage to bosses",
    baseCost: 3000,
    costMultiplier: 1.35,
    damageIncrease: 60,
    owned: 0,
    category: "special",
    tier: "rare",
  },
  {
    id: "boss-3",
    name: "God Killer",
    description: "+100% damage to bosses",
    baseCost: 18000,
    costMultiplier: 1.45,
    damageIncrease: 250,
    owned: 0,
    category: "special",
    tier: "epic",
  },

  // Ultimate Power
  {
    id: "ultimate-1",
    name: "Ascension",
    description: "Transcend mortal limits",
    baseCost: 50000,
    costMultiplier: 1.5,
    damageIncrease: 1000,
    owned: 0,
    category: "ultimate",
    tier: "legendary",
  },
  {
    id: "ultimate-2",
    name: "Omnipotence",
    description: "Become unstoppable",
    baseCost: 100000,
    costMultiplier: 1.6,
    damageIncrease: 2500,
    owned: 0,
    category: "ultimate",
    tier: "legendary",
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

  // Prestige
  const handlePrestige = useCallback(async () => {
    if (!userId || !progress || progress.current_stage < 2) return;

    // Calculate bonus multiplier (0.1 per stage completed)
    const bonusMultiplier = 1 + (progress.current_stage - 1) * 0.1;
    const newMultiplier = progress.prestige_multiplier + bonusMultiplier;

    // Reset progress
    const resetProgress = {
      current_stage: 1,
      current_level: 1,
      damage_per_click: 1,
      currency: 0,
      upgrades: {},
      attack_damage: 0,
      crafting_materials: 0,
      prestige_level: progress.prestige_level + 1,
      prestige_multiplier: newMultiplier,
      premium_currency: progress.premium_currency || 0,
      left_hand_weapon: null,
      right_hand_weapon: null,
      total_damage: 1,
    };

    // Delete all inventory items
    await supabase
      .from("functional_inventory")
      .delete()
      .eq("user_id", userId);

    // Update progress
    await saveProgress(resetProgress);
    
    setProgress(resetProgress);
    setInventory([]);
    setUpgrades(UPGRADES.map(u => ({ ...u, owned: 0 })));
    setCurrentEnemy(generateEnemy(1, 1));
    setAttackIndex(0);
    setCurrentAttack(null);
    
    toast.success(`Prestiged! New multiplier: ${newMultiplier.toFixed(1)}x`);
  }, [userId, progress, saveProgress]);

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
    handlePrestige,
  };
};