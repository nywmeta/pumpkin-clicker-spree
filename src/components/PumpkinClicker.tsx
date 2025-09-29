import { useState, useEffect, useCallback } from "react";
import pumpkinImage from "@/assets/pumpkin.png";

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  value: number;
}

interface PumpkinClickerProps {
  onPumpkinClick: () => void;
  pumpkinsPerClick: number;
}

export const PumpkinClicker = ({ onPumpkinClick, pumpkinsPerClick }: PumpkinClickerProps) => {
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onPumpkinClick();
    setIsClicking(true);
    
    // Create click effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newEffect: ClickEffect = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: pumpkinsPerClick
    };
    
    setClickEffects(prev => [...prev, newEffect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
    
    // Reset clicking state
    setTimeout(() => setIsClicking(false), 100);
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
          className="w-48 h-48 object-contain drop-shadow-lg"
        />
        
        {/* Click Effects */}
        {clickEffects.map((effect) => (
          <div
            key={effect.id}
            className="click-effect"
            style={{
              left: effect.x,
              top: effect.y,
            }}
          >
            +{effect.value}
          </div>
        ))}
      </button>
    </div>
  );
};