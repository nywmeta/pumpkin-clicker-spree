import { useState, useEffect, useCallback } from "react";
import pumpkinImage from "@/assets/pumpkin.png";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  direction: string;
}

interface PumpkinClickerProps {
  onPumpkinClick: () => void;
  pumpkinsPerClick: number;
}

export const PumpkinClicker = ({ onPumpkinClick, pumpkinsPerClick }: PumpkinClickerProps) => {
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onPumpkinClick();
    setIsClicking(true);
    setIsSpinning(true);
    
    // Create multiple mini pumpkin effects
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Create multiple mini pumpkins for the click value
    const newEffects: ClickEffect[] = [];
    for (let i = 0; i < pumpkinsPerClick; i++) {
      const angle = (360 / pumpkinsPerClick) * i + Math.random() * 30;
      const distance = 80 + Math.random() * 40;
      const deltaX = Math.cos(angle * Math.PI / 180) * distance;
      const deltaY = Math.sin(angle * Math.PI / 180) * distance;
      
      newEffects.push({
        id: Date.now() + Math.random() + i,
        x: centerX,
        y: centerY,
        direction: `translate(${deltaX}px, ${deltaY}px)`
      });
    }
    
    setClickEffects(prev => [...prev, ...newEffects]);
    
    // Remove effects after animation
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => 
        !newEffects.some(newEffect => newEffect.id === effect.id)
      ));
    }, 1500);
    
    // Reset states
    setTimeout(() => setIsClicking(false), 100);
    setTimeout(() => setIsSpinning(false), 600);
  }, [onPumpkinClick, pumpkinsPerClick]);

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={handleClick}
        className={`pumpkin-clicker w-64 h-64 flex items-center justify-center ${
          isClicking ? "animate-pulse-glow" : ""
        }`}
      >
        <img 
          src={pumpkinImage} 
          alt="Pumpkin" 
          className={`w-48 h-48 object-contain drop-shadow-lg ${
            isSpinning ? "animate-spin-once" : ""
          }`}
        />
        
        {/* Mini Pumpkin Effects */}
        {clickEffects.map((effect) => (
          <div
            key={effect.id}
            className="click-effect"
            style={{
              left: effect.x,
              top: effect.y,
              '--fly-direction': effect.direction,
            } as React.CSSProperties}
          >
            <img 
              src={pumpkinImage} 
              alt="Mini pumpkin" 
              className="mini-pumpkin object-contain"
            />
          </div>
        ))}
      </button>
    </div>
  );
};