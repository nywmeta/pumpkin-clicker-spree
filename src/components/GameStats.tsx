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
    <div className="text-center space-y-4">
      <div className="bg-card rounded-lg p-6 border border-border shadow-lg">
        <h2 className="text-lg font-semibold text-muted-foreground mb-2">Pumpkins</h2>
        <div className="counter-display">
          {formatNumber(pumpkins)}
        </div>
      </div>
      
      {pumpkinsPerSecond > 0 && (
        <div className="bg-card rounded-lg p-4 border border-border shadow-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Per Second</h3>
          <div className="text-2xl font-bold text-accent">
            {formatNumber(pumpkinsPerSecond)}
          </div>
        </div>
      )}
    </div>
  );
};