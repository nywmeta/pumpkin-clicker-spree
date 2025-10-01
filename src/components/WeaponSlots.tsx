import { Card } from "@/components/ui/card";
import { Sword } from "lucide-react";

interface WeaponSlotsProps {
  leftHand: string | null | undefined;
  rightHand: string | null | undefined;
}

export const WeaponSlots = ({ leftHand, rightHand }: WeaponSlotsProps) => {
  return (
    <div className="absolute bottom-4 left-4 flex gap-2">
      <Card className="bg-card/80 backdrop-blur border-border p-3 w-20 h-20">
        <div className="flex flex-col items-center justify-center h-full">
          <Sword className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Left</span>
          {leftHand && (
            <span className="text-xs font-bold text-foreground">{leftHand}</span>
          )}
        </div>
      </Card>
      
      <Card className="bg-card/80 backdrop-blur border-border p-3 w-20 h-20">
        <div className="flex flex-col items-center justify-center h-full">
          <Sword className="h-6 w-6 text-muted-foreground mb-1 -scale-x-100" />
          <span className="text-xs text-muted-foreground">Right</span>
          {rightHand && (
            <span className="text-xs font-bold text-foreground">{rightHand}</span>
          )}
        </div>
      </Card>
    </div>
  );
};
