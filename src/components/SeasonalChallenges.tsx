import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Sword, TrendingUp, Shield, Wrench, Trophy } from "lucide-react";

interface SeasonalChallengesProps {
  open: boolean;
  onClose: () => void;
  challenges: any[];
  userProgress: Map<string, any>;
}

export const SeasonalChallenges = ({
  open,
  onClose,
  challenges,
  userProgress
}: SeasonalChallengesProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combat': return <Sword className="w-4 h-4" />;
      case 'progression': return <TrendingUp className="w-4 h-4" />;
      case 'raid': return <Shield className="w-4 h-4" />;
      case 'crafting': return <Wrench className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'hard': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'legendary': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default: return 'bg-muted';
    }
  };

  const categories = ['all', ...new Set(challenges.map(c => c.category))];

  const filterChallenges = (category: string) => {
    if (category === 'all') return challenges;
    return challenges.filter(c => c.category === category);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Seasonal Challenges</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="combat">Combat</TabsTrigger>
            <TabsTrigger value="progression">Progress</TabsTrigger>
            <TabsTrigger value="raid">Raid</TabsTrigger>
            <TabsTrigger value="crafting">Crafting</TabsTrigger>
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {filterChallenges(category).map(challenge => {
                    const progress = userProgress.get(challenge.challenge_key);
                    const currentProgress = progress?.progress || 0;
                    const isCompleted = progress?.completed || false;
                    const progressPercentage = Math.min(
                      (currentProgress / challenge.requirement) * 100,
                      100
                    );

                    return (
                      <div
                        key={challenge.id}
                        className={`border rounded-lg p-4 ${
                          isCompleted ? 'bg-green-500/5 border-green-500/30' : 'bg-card'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getCategoryIcon(challenge.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{challenge.name}</h3>
                                {isCompleted && (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {challenge.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={getDifficultyColor(challenge.difficulty)}
                            >
                              {challenge.difficulty}
                            </Badge>
                            <div className="text-sm font-semibold text-primary">
                              +{challenge.xp_reward} XP
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Progress</span>
                            <span>
                              {currentProgress.toLocaleString()} / {challenge.requirement.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
