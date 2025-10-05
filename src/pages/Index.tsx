import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRPGGame } from "@/hooks/useRPGGame";
import { HUD } from "@/components/HUD";
import { EnemyDisplay } from "@/components/EnemyDisplay";
import { UpgradeShop } from "@/components/UpgradeShop";
import { WeaponSlots } from "@/components/WeaponSlots";
import { DodgeOverlay } from "@/components/DodgeOverlay";
import { Inventory } from "@/components/Inventory";
import { Settings } from "@/components/Settings";
import { MobileNav } from "@/components/MobileNav";
import { Leaderboard } from "@/components/Leaderboard";
import RaidBoss from "@/components/RaidBoss";
import LootboxOpening from "@/components/LootboxOpening";
import CosmeticInventory from "@/components/CosmeticInventory";
import { Achievements } from "@/components/Achievements";
import { DailyReward } from "@/components/DailyReward";
import { useCosmetics } from "@/hooks/useCosmetics";
import { useAchievements } from "@/hooks/useAchievements";
import { useDailyRewards } from "@/hooks/useDailyRewards";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [lootboxOpen, setLootboxOpen] = useState(false);
  const [cosmeticOpen, setCosmeticOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [dailyRewardOpen, setDailyRewardOpen] = useState(false);
  
  const { cosmetics, openLootbox, equipCosmetic } = useCosmetics(user?.id);
  const { 
    achievements, 
    userAchievements, 
    updateAchievementProgress, 
    claimAchievementReward 
  } = useAchievements(user?.id);
  const { 
    dailyReward, 
    canClaim, 
    claimDailyReward, 
    getCurrentReward, 
    DAILY_REWARDS 
  } = useDailyRewards(user?.id);
  
  const { 
    progress, 
    currentEnemy, 
    loading: gameLoading, 
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
  } = useRPGGame(user?.id);

  // Track achievements based on progress
  useEffect(() => {
    if (!user?.id || !progress) return;
    
    // Track damage achievements
    updateAchievementProgress('damage_1k', progress.total_damage);
    updateAchievementProgress('damage_10k', progress.total_damage);
    updateAchievementProgress('damage_100k', progress.total_damage);
    updateAchievementProgress('damage_1m', progress.total_damage);
    
    // Track stage achievements
    updateAchievementProgress('stage_5', progress.current_stage);
    updateAchievementProgress('stage_10', progress.current_stage);
    updateAchievementProgress('stage_25', progress.current_stage);
    updateAchievementProgress('stage_50', progress.current_stage);
    
    // Track prestige achievements
    updateAchievementProgress('prestige_1', progress.prestige_level);
    updateAchievementProgress('prestige_5', progress.prestige_level);
    updateAchievementProgress('prestige_10', progress.prestige_level);
  }, [progress, user?.id]);

  // Track weapon collection achievements
  useEffect(() => {
    if (!user?.id || !inventory) return;
    
    const weaponCount = inventory.filter(item => item.item_type === 'weapon').length;
    updateAchievementProgress('weapons_10', weaponCount);
    updateAchievementProgress('weapons_50', weaponCount);
    
    // Check for legendary weapon
    const hasLegendary = inventory.some(item => 
      item.item_type === 'weapon' && 
      ['yellow', 'orange', 'red', 'pink', 'violet', 'black'].includes(item.rarity)
    );
    if (hasLegendary) {
      updateAchievementProgress('legendary_weapon', 1);
    }
  }, [inventory, user?.id]);

  if (authLoading || gameLoading || !progress || !currentEnemy) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-bold text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col relative">
      <HUD progress={progress} />
      
      <Inventory
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        items={inventory}
        craftingMaterials={progress.crafting_materials}
        onEquip={equipWeapon}
        onSalvage={salvageItem}
        onCraft={craftWeapon}
      />
      
      <UpgradeShop
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        upgrades={upgrades} 
        currency={progress.currency}
        onPurchase={purchaseUpgrade}
      />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={signOut}
        prestigeLevel={progress.prestige_level}
        onPrestige={handlePrestige}
        canPrestige={progress.current_stage >= 2}
      />

      <Leaderboard
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentUserId={user?.id}
      />

      <div className="fixed top-4 right-4 w-96 z-40">
        <RaidBoss 
          userId={user?.id}
          playerDamage={progress.attack_damage}
          onAttack={attackEnemy}
        />
      </div>
      
      <WeaponSlots
        leftHand={progress.left_hand_weapon}
        rightHand={progress.right_hand_weapon}
      />
      
      <DodgeOverlay
        attack={currentAttack}
        onDodge={handleDodge}
        onTimeout={handleDodgeTimeout}
      />
      
      <div className="flex-1 flex items-center justify-center pb-20">
        <EnemyDisplay enemy={currentEnemy} onAttack={attackEnemy} />
      </div>

      <MobileNav
        onInventoryClick={() => setInventoryOpen(true)}
        onShopClick={() => setShopOpen(true)}
        onLeaderboardClick={() => setLeaderboardOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onLootboxClick={() => setLootboxOpen(true)}
        onCosmeticClick={() => setCosmeticOpen(true)}
        onAchievementsClick={() => setAchievementsOpen(true)}
        onDailyRewardClick={() => setDailyRewardOpen(true)}
      />

      <LootboxOpening
        open={lootboxOpen}
        onClose={() => setLootboxOpen(false)}
        onOpen={openLootbox}
        premiumCurrency={progress.premium_currency || 0}
      />

      <CosmeticInventory
        open={cosmeticOpen}
        onClose={() => setCosmeticOpen(false)}
        cosmetics={cosmetics}
        onEquip={equipCosmetic}
      />

      <Achievements
        isOpen={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        achievements={achievements}
        userAchievements={userAchievements}
        onClaim={claimAchievementReward}
      />

      <DailyReward
        isOpen={dailyRewardOpen}
        onClose={() => setDailyRewardOpen(false)}
        canClaim={canClaim}
        currentStreak={dailyReward?.current_streak || 0}
        longestStreak={dailyReward?.longest_streak || 0}
        totalClaims={dailyReward?.total_claims || 0}
        onClaim={claimDailyReward}
        currentReward={getCurrentReward()}
        allRewards={DAILY_REWARDS}
      />
    </div>
  );
};

export default Index;
