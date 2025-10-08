import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRPGGame } from "@/hooks/useRPGGame";
import { HUD } from "@/components/HUD";
import { EnemyDisplay } from "@/components/EnemyDisplay";
import { UpgradeShop } from "@/components/UpgradeShop";
import { DodgeOverlay } from "@/components/DodgeOverlay";
import { UnifiedInventory } from "@/components/UnifiedInventory";
import { Settings } from "@/components/Settings";
import { MobileNav } from "@/components/MobileNav";
import { Leaderboard } from "@/components/Leaderboard";
import RaidBoss from "@/components/RaidBoss";
import LootboxOpening from "@/components/LootboxOpening";
import { Achievements } from "@/components/Achievements";
import { DailyReward } from "@/components/DailyReward";
import { Social } from "@/components/Social";
import { BattlePass } from "@/components/BattlePass";
import { SeasonalChallenges } from "@/components/SeasonalChallenges";
import PremiumShop from "@/components/PremiumShop";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCosmetics } from "@/hooks/useCosmetics";
import { useAchievements } from "@/hooks/useAchievements";
import { useDailyRewards } from "@/hooks/useDailyRewards";
import { useBattlePass } from "@/hooks/useBattlePass";
import { useSeasonalChallenges } from "@/hooks/useSeasonalChallenges";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [lootboxOpen, setLootboxOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [dailyRewardOpen, setDailyRewardOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [battlePassOpen, setBattlePassOpen] = useState(false);
  const [challengesOpen, setChallengesOpen] = useState(false);
  const [premiumShopOpen, setPremiumShopOpen] = useState(false);
  
  const { cosmetics, openLootbox, equipCosmetic, refreshCosmetics } = useCosmetics(user?.id);
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
    activeSeason,
    tiers,
    userProgress: battlePassProgress,
    loading: battlePassLoading,
    addXP,
    claimReward,
    purchasePremium
  } = useBattlePass(user?.id);
  
  const {
    challenges,
    userProgress: challengeProgress,
    loading: challengesLoading,
    updateChallengeProgress
  } = useSeasonalChallenges(user?.id, addXP);
  
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

  // Track seasonal challenges
  useEffect(() => {
    if (!user?.id || !progress) return;
    
    // Update damage challenges
    updateChallengeProgress('season1_damage_10k', progress.total_damage);
    updateChallengeProgress('season1_damage_100k', progress.total_damage);
    updateChallengeProgress('season1_damage_1m', progress.total_damage);
    
    // Update stage challenges
    updateChallengeProgress('season1_stages_10', progress.current_stage);
    updateChallengeProgress('season1_stages_25', progress.current_stage);
  }, [progress, user?.id]);

  // Track crafting challenges
  useEffect(() => {
    if (!user?.id || !inventory) return;
    
    const craftedCount = inventory.filter(item => item.item_type === 'weapon').length;
    updateChallengeProgress('season1_crafts_20', craftedCount);
    
    // Check for legendary craft
    const hasLegendary = inventory.some(item => 
      item.item_type === 'weapon' && 
      ['yellow', 'orange', 'red', 'pink', 'violet', 'black'].includes(item.rarity)
    );
    if (hasLegendary) {
      updateChallengeProgress('season1_legendary_craft', 1);
    }
  }, [inventory, user?.id]);

  if (authLoading || gameLoading || !progress || !currentEnemy) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col relative">
      <HUD progress={progress} />
      
      <UnifiedInventory
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
        items={inventory}
        cosmetics={cosmetics}
        craftingMaterials={progress.crafting_materials}
        leftHandWeapon={progress.left_hand_weapon}
        rightHandWeapon={progress.right_hand_weapon}
        onEquipItem={equipWeapon}
        onSalvageItem={salvageItem}
        onCraftItem={craftWeapon}
        onEquipCosmetic={equipCosmetic}
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
        onAchievementsClick={() => setAchievementsOpen(true)}
        onDailyRewardClick={() => setDailyRewardOpen(true)}
        onSocialClick={() => setSocialOpen(true)}
        onBattlePassClick={() => setBattlePassOpen(true)}
        onChallengesClick={() => setChallengesOpen(true)}
        onPremiumShopClick={() => setPremiumShopOpen(true)}
      />

      <LootboxOpening
        open={lootboxOpen}
        onClose={() => setLootboxOpen(false)}
        onOpen={openLootbox}
        premiumCurrency={progress.premium_currency || 0}
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

      <Social
        isOpen={socialOpen}
        onClose={() => setSocialOpen(false)}
        userId={user?.id}
        username={user?.email?.split('@')[0]}
      />

      <BattlePass
        open={battlePassOpen}
        onClose={() => setBattlePassOpen(false)}
        activeSeason={activeSeason}
        tiers={tiers}
        userProgress={battlePassProgress}
        onClaimReward={claimReward}
        onPurchasePremium={purchasePremium}
      />

      <SeasonalChallenges
        open={challengesOpen}
        onClose={() => setChallengesOpen(false)}
        challenges={challenges}
        userProgress={challengeProgress}
      />

      <PremiumShop
        open={premiumShopOpen}
        onClose={() => setPremiumShopOpen(false)}
        userId={user?.id || ''}
        premiumCurrency={progress.premium_currency || 0}
        currency={progress.currency}
        onPurchase={() => {
          refreshCosmetics();
        }}
      />
    </div>
  );
};

export default Index;
