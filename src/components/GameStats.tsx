interface GameStatsProps {
  pumpkins: number;
  pumpkinsPerSecond: number;
}

export const GameStats = ({ pumpkins, pumpkinsPerSecond }: GameStatsProps) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num).toLocaleString();
  };

  return (
    <div className="space-y-2">
      <div className="bg-card/80 backdrop-blur rounded-lg p-3 border border-border shadow-lg">
        <div className="text-2xl font-bold text-foreground">
          {formatNumber(pumpkins)}
        </div>
      </div>
      
      {pumpkinsPerSecond > 0 && (
        <div className="bg-card/80 backdrop-blur rounded-lg p-2 border border-border shadow-lg">
          <div className="text-sm font-bold text-accent">
            {formatNumber(pumpkinsPerSecond)}/s
          </div>
        </div>
      )}
    </div>
  );
};