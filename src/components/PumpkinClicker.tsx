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
  const [spinSpeed, setSpinSpeed] = useState(0);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onPumpkinClick();
    setIsClicking(true);
    
    // Increase spin speed
    setSpinSpeed(prev => Math.min(prev + 0.2, 2)); // Cap at 2x speed
    
    // Create multiple mini pumpkin effects
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Create multiple mini pumpkins for the click value
    const newEffects: ClickEffect[] = [];
    for (let i = 0; i < pumpkinsPerClick; i++) {
      const angle = (360 / pumpkinsPerClick) * i + Math.random() * 60 - 30;
      const distance = 60 + Math.random() * 30;
      const deltaX = Math.cos(angle * Math.PI / 180) * distance;
      const deltaY = Math.sin(angle * Math.PI / 180) * distance - 20; // Start slightly upward
      
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
    }, 2000); // Longer duration for gravity effect
    
    // Reset clicking state
    setTimeout(() => setIsClicking(false), 100);
  }, [onPumpkinClick, pumpkinsPerClick]);

  // Gradually slow down spin speed
  useEffect(() => {
    if (spinSpeed > 0) {
      const interval = setInterval(() => {
        setSpinSpeed(prev => Math.max(prev - 0.05, 0)); // Gradually slow down
      }, 100);
      return () => clearInterval(interval);
    }
  }, [spinSpeed]);

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
          className="pumpkin-main-image w-48 h-48 object-contain drop-shadow-lg"
          style={{
            animation: spinSpeed > 0 ? `main-pumpkin-spin ${Math.max(0.3, 1 - spinSpeed)}s linear infinite` : 'none'
          }}
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