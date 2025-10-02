import { X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  prestigeLevel: number;
  onPrestige: () => void;
  canPrestige: boolean;
}

export const Settings = ({
  open,
  onClose,
  onLogout,
  prestigeLevel,
  onPrestige,
  canPrestige,
}: SettingsProps) => {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Settings
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Prestige Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Prestige</h3>
            <div className="p-4 border rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                Current Prestige Level: <span className="font-bold text-foreground">{prestigeLevel}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Prestige resets your progress but grants a permanent damage multiplier.
              </p>
              <Button
                onClick={onPrestige}
                disabled={!canPrestige}
                variant="destructive"
                className="w-full mt-2"
              >
                {canPrestige ? "Prestige Now" : "Complete Stage 1 to Prestige"}
              </Button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="pt-4 border-t">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};