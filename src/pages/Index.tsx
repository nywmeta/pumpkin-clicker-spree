import { useAuth } from "@/hooks/useAuth";
import { useRPGGame } from "@/hooks/useRPGGame";
import { HUD } from "@/components/HUD";
import { EnemyDisplay } from "@/components/EnemyDisplay";
import { UpgradeShop } from "@/components/UpgradeShop";
import { WeaponSlots } from "@/components/WeaponSlots";
import { DodgeOverlay } from "@/components/DodgeOverlay";
import { Inventory } from "@/components/Inventory";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
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
      <HUD progress={progress} onLogout={signOut} />
      
      <Inventory
        items={inventory}
        craftingMaterials={progress.crafting_materials}
        onEquip={equipWeapon}
        onSalvage={salvageItem}
        onCraft={craftWeapon}
      />
      
      <UpgradeShop 
        upgrades={upgrades} 
        currency={progress.currency}
        onPurchase={purchaseUpgrade}
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
      
      <div className="flex-1 flex items-center justify-center">
        <EnemyDisplay enemy={currentEnemy} onAttack={attackEnemy} />
      </div>
    </div>
  );
};

export default Index;
