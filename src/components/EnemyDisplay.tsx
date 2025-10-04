import { Enemy } from "@/types/game";
import pumpkinImage from "@/assets/pumpkin.png";
import { Progress } from "@/components/ui/progress";

interface EnemyDisplayProps {
  enemy: Enemy;
  onAttack: () => void;
}

const getEnemyFilter = (name: string, isBoss: boolean) => {
  const baseFilter = isBoss ? "brightness(0.8) contrast(1.2)" : "brightness(1)";
  
  if (name.includes("Karen")) {
    return `${baseFilter} sepia(0.3) saturate(2) hue-rotate(310deg)`;
  } else if (name.includes("Snus")) {
    return `${baseFilter} sepia(0.5) saturate(1.5) hue-rotate(90deg)`;
  } else if (name.includes("Slow Driver")) {
    return `${baseFilter} sepia(0.4) saturate(1.3) hue-rotate(200deg)`;
  } else if (name.includes("Bed")) {
    return `${baseFilter} sepia(0.3) saturate(1.2) hue-rotate(260deg)`;
  } else if (name.includes("Job Application")) {
    return `${baseFilter} sepia(0.6) saturate(1.8) hue-rotate(10deg)`;
  } else if (name.includes("Pumpkin")) {
    return baseFilter;
  }
  return baseFilter;
};

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
            filter: getEnemyFilter(enemy.name, enemy.isBoss)
          }}
        />
      </button>
    </div>
  );
};