import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Star, Swords, Target, Gift, Zap } from "lucide-react";

interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  requirement: number;
  reward_type: string;
  reward_amount: number;
}

interface UserAchievement {
  achievement_key: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

interface AchievementsProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  onClaim: (key: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'damage': return <Swords className="w-4 h-4" />;
    case 'progression': return <Target className="w-4 h-4" />;
    case 'engagement': return <Zap className="w-4 h-4" />;
    case 'raid': return <Trophy className="w-4 h-4" />;
    case 'prestige': return <Star className="w-4 h-4" />;
    case 'collection': return <Gift className="w-4 h-4" />;
    default: return <Trophy className="w-4 h-4" />;
  }
};

const getTierColor = (tier: number) => {
  switch (tier) {
    case 1: return 'bg-gray-500';
    case 2: return 'bg-blue-500';
    case 3: return 'bg-purple-500';
    case 4: return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export const Achievements = ({ isOpen, onClose, achievements, userAchievements, onClaim }: AchievementsProps) => {
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const getStatus = (achievementKey: string) => {
    return userAchievements.find(ua => ua.achievement_key === achievementKey);
  };

  const completedCount = userAchievements.filter(ua => ua.completed).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Achievements ({completedCount}/{achievements.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                </h3>
                
                <div className="grid gap-3">
                  {categoryAchievements.map((achievement) => {
                    const status = getStatus(achievement.achievement_key);
                    const progress = status?.progress || 0;
                    const completed = status?.completed || false;
                    const claimed = status?.claimed || false;
                    const progressPercent = Math.min((progress / achievement.requirement) * 100, 100);

                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border ${
                          completed ? 'border-primary bg-primary/5' : 'border-border'
                        } ${!completed && progress === 0 ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getTierColor(achievement.tier)}`} />
                              <h4 className="font-semibold">{achievement.name}</h4>
                              {completed && (
                                <Badge variant="outline" className="ml-auto">
                                  {claimed ? 'Claimed' : 'Ready!'}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>Progress: {progress.toLocaleString()} / {achievement.requirement.toLocaleString()}</span>
                                <span>{progressPercent.toFixed(0)}%</span>
                              </div>
                              <Progress value={progressPercent} />
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Reward:</span>
                              <span className="font-semibold text-primary">
                                {achievement.reward_amount} {achievement.reward_type === 'premium_currency' ? 'Gems 💎' : 'Gold 🪙'}
                              </span>
                            </div>
                          </div>
                          
                          {completed && !claimed && (
                            <Button
                              size="sm"
                              onClick={() => onClaim(achievement.achievement_key)}
                            >
                              Claim
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
