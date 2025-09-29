import { useState, useEffect, useCallback } from "react";
import { Upgrade } from "@/components/UpgradeShop";

const SAVE_KEY = "pumpkin-clicker-save";

interface GameState {
  pumpkins: number;
  pumpkinsPerClick: number;
  pumpkinsPerSecond: number;
  upgrades: Upgrade[];
  lastSave: number;
}

const initialUpgrades: Upgrade[] = [
  {
    id: "auto-picker",
    name: "Auto Picker",
    description: "Automatically picks pumpkins",
    baseCost: 10,
    currentCost: 10,
    owned: 0,
    pumpkinsPerSecond: 1,
    icon: "🤖"
  },
  {
    id: "pumpkin-farm",
    name: "Pumpkin Farm",
    description: "A small pumpkin farm",
    baseCost: 100,
    currentCost: 100,
    owned: 0,
    pumpkinsPerSecond: 8,
    icon: "🚜"
  },
  {
    id: "magic-seeds",
    name: "Magic Seeds",
    description: "Seeds that grow super fast",
    baseCost: 1000,
    currentCost: 1000,
    owned: 0,
    pumpkinsPerSecond: 50,
    icon: "✨"
  },
  {
    id: "pumpkin-factory",
    name: "Pumpkin Factory",
    description: "Industrial pumpkin production",
    baseCost: 10000,
    currentCost: 10000,
    owned: 0,
    pumpkinsPerSecond: 300,
    icon: "🏭"
  }
];

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Calculate offline progress
      const offlineTime = Math.min((Date.now() - parsed.lastSave) / 1000, 3600); // Max 1 hour
      const offlinePumpkins = offlineTime * parsed.pumpkinsPerSecond;
      
      return {
        ...parsed,
        pumpkins: parsed.pumpkins + offlinePumpkins
      };
    }
    
    return {
      pumpkins: 0,
      pumpkinsPerClick: 1,
      pumpkinsPerSecond: 0,
      upgrades: initialUpgrades,
      lastSave: Date.now()
    };
  });

  // Save game state
  const saveGame = useCallback(() => {
    const saveData = {
      ...gameState,
      lastSave: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }, [gameState]);

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(saveGame, 10000);
    return () => clearInterval(interval);
  }, [saveGame]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => saveGame();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveGame]);

  // Pumpkin generation per second
  useEffect(() => {
    if (gameState.pumpkinsPerSecond > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          pumpkins: prev.pumpkins + prev.pumpkinsPerSecond
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.pumpkinsPerSecond]);

  const clickPumpkin = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pumpkins: prev.pumpkins + prev.pumpkinsPerClick
    }));
  }, []);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      if (!upgrade || prev.pumpkins < upgrade.currentCost) {
        return prev;
      }

      const newUpgrades = prev.upgrades.map(u => {
        if (u.id === upgradeId) {
          return {
            ...u,
            owned: u.owned + 1,
            currentCost: Math.ceil(u.baseCost * Math.pow(1.15, u.owned + 1))
          };
        }
        return u;
      });

      const newPumpkinsPerSecond = newUpgrades.reduce(
        (total, u) => total + (u.pumpkinsPerSecond * u.owned),
        0
      );

      return {
        ...prev,
        pumpkins: prev.pumpkins - upgrade.currentCost,
        upgrades: newUpgrades,
        pumpkinsPerSecond: newPumpkinsPerSecond
      };
    });
  }, []);

  return {
    pumpkins: gameState.pumpkins,
    pumpkinsPerClick: gameState.pumpkinsPerClick,
    pumpkinsPerSecond: gameState.pumpkinsPerSecond,
    upgrades: gameState.upgrades,
    clickPumpkin,
    purchaseUpgrade,
    saveGame
  };
};