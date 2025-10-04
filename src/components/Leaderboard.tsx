import { Trophy, Medal, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  current_stage: number;
  current_level: number;
  prestige_level: number;
  damage_per_click: number;
  total_score: number;
  updated_at: string;
}

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const Leaderboard = ({ open, onClose, currentUserId }: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadLeaderboard();
    }
  }, [open]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .limit(100);

    if (!error && data) {
      setLeaderboard(data as LeaderboardEntry[]);
    }
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No players yet!
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`p-3 rounded-lg border ${
                    entry.user_id === currentUserId
                      ? "bg-primary/10 border-primary"
                      : "bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <span className="font-bold">
                        {entry.username || "Anonymous"}
                      </span>
                    </div>
                    {entry.prestige_level > 0 && (
                      <span className="text-xs font-bold text-primary">
                        P{entry.prestige_level}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Stage {entry.current_stage}</span>
                    <span>Level {entry.current_level}</span>
                    <span>{Math.floor(entry.damage_per_click)} DMG</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
