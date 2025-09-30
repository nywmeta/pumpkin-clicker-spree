import { useAuth } from "@/hooks/useAuth";
import { useRPGGame } from "@/hooks/useRPGGame";
import { HUD } from "@/components/HUD";
import { EnemyDisplay } from "@/components/EnemyDisplay";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { progress, currentEnemy, loading: gameLoading, attackEnemy } = useRPGGame(user?.id);

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
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <HUD progress={progress} onLogout={signOut} />
      
      <div className="flex-1 flex items-center justify-center">
        <EnemyDisplay enemy={currentEnemy} onAttack={attackEnemy} />
      </div>
    </div>
  );
};

export default Index;
