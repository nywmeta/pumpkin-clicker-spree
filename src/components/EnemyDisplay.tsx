import { Enemy } from "@/types/game";
import pumpkinImage from "@/assets/pumpkin.png";
import { Progress } from "@/components/ui/progress";

interface EnemyDisplayProps {
  enemy: Enemy;
  onAttack: () => void;
}

export const EnemyDisplay = ({ enemy, onAttack }: EnemyDisplayProps) => {
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Enemy name and level indicator */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          {enemy.name}
        </h2>
        {enemy.isBoss && (
          <span className="text-sm font-bold text-destructive">BOSS</span>
        )}
      </div>

      {/* Health bar */}
      <div className="w-64 space-y-1">
        <Progress value={healthPercent} className="h-4" />
        <div className="text-xs text-muted-foreground text-center">
          {Math.floor(enemy.health)} / {Math.floor(enemy.maxHealth)}
        </div>
      </div>

      {/* Enemy sprite (clickable) */}
      <button
        onClick={onAttack}
        className="relative transition-transform hover:scale-105 active:scale-95"
      >
        <img
          src={pumpkinImage}
          alt={enemy.name}
          className="w-48 h-48 object-contain drop-shadow-lg"
          style={{
            filter: enemy.isBoss ? "brightness(0.8) sepia(1) hue-rotate(-30deg)" : "none"
          }}
        />
      </button>
    </div>
  );
};