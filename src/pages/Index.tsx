import { useState } from "react";
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

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
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
      />
    </div>
  );
};

export default Index;
