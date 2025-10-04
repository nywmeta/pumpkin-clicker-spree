import { PlayerProgress } from "@/types/game";

interface HUDProps {
  progress: PlayerProgress;
}

export const HUD = ({ progress }: HUDProps) => {
  return (
    <div className="bg-card border-b p-2 sm:p-3">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-6">
          <div>
            <span className="text-xs text-muted-foreground">Stage</span>
            <div className="text-base sm:text-lg font-bold">{progress.current_stage}</div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Level</span>
            <div className="text-base sm:text-lg font-bold">{progress.current_level}</div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Gold</span>
            <div className="text-base sm:text-lg font-bold">{progress.currency.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">💎 Gems</span>
            <div className="text-base sm:text-lg font-bold text-blue-500">{progress.premium_currency || 0}</div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">DMG</span>
            <div className="text-base sm:text-lg font-bold">{Math.floor(progress.damage_per_click * progress.prestige_multiplier)}</div>
          </div>
        </div>

        {progress.prestige_level > 0 && (
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Prestige</span>
            <div className="text-base sm:text-lg font-bold text-primary">{progress.prestige_level}</div>
          </div>
        )}
      </div>
    </div>
  );
};
