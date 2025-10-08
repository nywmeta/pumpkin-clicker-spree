import { Enemy } from "@/types/game";
import { Progress } from "@/components/ui/progress";
import pumpkinMonster1 from "@/assets/pumpkin-monster-1.png";
import pumpkinMonster2 from "@/assets/pumpkin-monster-2.png";
import pumpkinMonster3 from "@/assets/pumpkin-monster-3.png";
import pumpkinMonster4 from "@/assets/pumpkin-monster-4.png";
import pumpkinMonster5 from "@/assets/pumpkin-monster-5.png";
import pumpkin from "@/assets/pumpkin.png";

interface EnemyDisplayProps {
  enemy: Enemy;
  onAttack: () => void;
}

const getEnemyFilter = (name: string, isBoss: boolean) => {
  if (isBoss) {
    return "drop-shadow(0 0 20px rgba(220, 38, 38, 0.8)) brightness(1.2)";
  }
  
  // Different filters for different enemy types
  if (name.includes("Pumpkin Grunt")) {
    return "drop-shadow(0 0 10px rgba(255, 165, 0, 0.5))";
  }
  if (name.includes("Gourd Guardian")) {
    return "drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))";
  }
  if (name.includes("Vine Stalker")) {
    return "drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))";
  }
  if (name.includes("Jack's Wrath")) {
    return "drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))";
  }
  if (name.includes("Harvest Horror")) {
    return "drop-shadow(0 0 10px rgba(239, 68, 68, 0.7)) brightness(1.1)";
  }
  
  return "drop-shadow(0 0 10px rgba(255, 165, 0, 0.3))";
};

export const EnemyDisplay = ({ enemy, onAttack }: EnemyDisplayProps) => {
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;

  // Determine which sprite to use based on enemy name
  const spriteKey = enemy.name.toLowerCase().replace(/boss /g, '');
  let enemySprite = pumpkin;
  
  if (spriteKey.includes('pumpkin grunt') || spriteKey.includes('pumpkin minion')) {
    enemySprite = pumpkinMonster1;
  } else if (spriteKey.includes('gourd guardian') || spriteKey.includes('karen')) {
    enemySprite = pumpkinMonster2;
  } else if (spriteKey.includes('vine stalker') || spriteKey.includes('snus')) {
    enemySprite = pumpkinMonster3;
  } else if (spriteKey.includes("jack's wrath") || spriteKey.includes('slow driver')) {
    enemySprite = pumpkinMonster4;
  } else if (spriteKey.includes('harvest horror') || spriteKey.includes('bed') || spriteKey.includes('job')) {
    enemySprite = pumpkinMonster5;
  }

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Enemy name and level indicator */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          {enemy.name}
          {enemy.isBoss && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-bold animate-pulse">
              BOSS
            </span>
          )}
        </h2>
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
        style={{ filter: getEnemyFilter(enemy.name, enemy.isBoss) }}
      >
        <img
          src={enemySprite}
          alt={enemy.name}
          className="w-64 h-64 object-contain"
          draggable={false}
        />
      </button>
    </div>
  );
};