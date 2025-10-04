import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sword, Clock, Users, Trophy } from 'lucide-react';
import { useRaidBoss } from '@/hooks/useRaidBoss';

interface RaidBossProps {
  userId: string | undefined;
  playerDamage: number;
  onAttack: () => void;
}

const RaidBoss = ({ userId, playerDamage, onAttack }: RaidBossProps) => {
  const { activeRaidBoss, myContribution, topContributors, attackRaidBoss } = useRaidBoss(userId, playerDamage);

  if (!activeRaidBoss) {
    return null;
  }

  const healthPercentage = (activeRaidBoss.current_health / activeRaidBoss.max_health) * 100;
  const timeRemaining = new Date(activeRaidBoss.expires_at).getTime() - Date.now();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const handleAttack = () => {
    onAttack();
    attackRaidBoss();
  };

  return (
    <Card className="border-2 border-destructive bg-gradient-to-br from-destructive/10 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sword className="h-6 w-6 text-destructive" />
            {activeRaidBoss.boss_name}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {hoursRemaining}h {minutesRemaining}m
          </div>
        </div>
        <CardDescription>Stage {activeRaidBoss.stage_level} Raid Boss - Cooperative Battle</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Global Health</span>
            <span className="font-mono">
              {activeRaidBoss.current_health.toLocaleString()} / {activeRaidBoss.max_health.toLocaleString()}
            </span>
          </div>
          <Progress value={healthPercentage} className="h-4" />
        </div>

        <Button 
          onClick={handleAttack}
          className="w-full"
          size="lg"
          variant="destructive"
        >
          <Sword className="mr-2 h-4 w-4" />
          Attack Raid Boss ({playerDamage.toLocaleString()} DMG)
        </Button>

        {myContribution && (
          <div className="bg-primary/10 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Your Damage
              </span>
              <span className="font-mono font-bold">
                {myContribution.damage_dealt.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Top Contributors
          </div>
          <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-2">
            {topContributors.map((contributor, index) => (
              <div 
                key={contributor.id}
                className="flex items-center justify-between p-2 mb-1 rounded bg-background/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold w-6">#{index + 1}</span>
                  <span className="text-sm">
                    {contributor.profiles?.username || 'Anonymous'}
                  </span>
                </div>
                <span className="text-sm font-mono">
                  {contributor.damage_dealt.toLocaleString()}
                </span>
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default RaidBoss;
