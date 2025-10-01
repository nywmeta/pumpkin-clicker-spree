import { useState, useEffect, useCallback } from "react";
import { BossAttack } from "@/types/game";
import { ArrowDown, ArrowDownLeft, ArrowDownRight } from "lucide-react";

interface DodgeOverlayProps {
  attack: BossAttack | null;
  onDodge: (direction: 'down' | 'down-left' | 'down-right') => void;
  onTimeout: () => void;
}

export const DodgeOverlay = ({ attack, onDodge, onTimeout }: DodgeOverlayProps) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!attack) return;

    const timer = setTimeout(() => {
      onTimeout();
    }, attack.dodgeWindow);

    return () => clearTimeout(timer);
  }, [attack, onTimeout]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart || !attack) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Swipe must be primarily downward
    if (deltaY > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaX < -30) {
        onDodge('down-left');
      } else if (deltaX > 30) {
        onDodge('down-right');
      } else {
        onDodge('down');
      }
    }

    setTouchStart(null);
  }, [touchStart, attack, onDodge]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!attack) return;

    if (e.key === 'ArrowDown' && e.shiftKey && e.code === 'ArrowLeft') {
      onDodge('down-left');
    } else if (e.key === 'ArrowDown' && e.shiftKey && e.code === 'ArrowRight') {
      onDodge('down-right');
    } else if (e.key === 'ArrowDown') {
      onDodge('down');
    }
  }, [attack, onDodge]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!attack) return null;

  const DirectionIcon = attack.direction === 'down' 
    ? ArrowDown 
    : attack.direction === 'down-left' 
    ? ArrowDownLeft 
    : ArrowDownRight;

  return (
    <div 
      className="absolute inset-0 bg-destructive/20 backdrop-blur-sm z-50 flex items-center justify-center animate-pulse"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold text-destructive animate-bounce">
          DODGE!
        </div>
        <DirectionIcon className="h-24 w-24 text-destructive mx-auto animate-bounce" />
        <div className="text-xl text-foreground">
          Swipe {attack.direction.replace('-', ' ')}!
        </div>
      </div>
    </div>
  );
};
