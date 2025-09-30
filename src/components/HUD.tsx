import { PlayerProgress } from "@/types/game";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HUDProps {
  progress: PlayerProgress;
  onLogout: () => void;
}

export const HUD = ({ progress, onLogout }: HUDProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num).toString();
  };

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
      {/* Left side - Progress */}
      <div className="space-y-2">
        <div className="bg-card/80 backdrop-blur rounded-lg px-4 py-2 border border-border shadow-lg">
          <div className="text-xs text-muted-foreground">Stage {progress.current_stage}</div>
          <div className="text-lg font-bold text-foreground">
            Level {progress.current_level}/69
          </div>
        </div>
        
        <div className="bg-card/80 backdrop-blur rounded-lg px-4 py-2 border border-border shadow-lg">
          <div className="text-xs text-muted-foreground">Currency</div>
          <div className="text-lg font-bold text-accent">
            {formatNumber(progress.currency)}
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur rounded-lg px-4 py-2 border border-border shadow-lg">
          <div className="text-xs text-muted-foreground">Damage</div>
          <div className="text-sm font-bold text-foreground">
            {formatNumber(progress.damage_per_click)}
          </div>
        </div>
      </div>

      {/* Right side - Logout */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onLogout}
        className="bg-card/80 backdrop-blur border border-border"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};