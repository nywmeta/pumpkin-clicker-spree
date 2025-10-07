import { useEffect, useState } from 'react';

interface DamageNumberProps {
  damage: number;
  x: number;
  y: number;
  isCritical?: boolean;
  onComplete: () => void;
}

export const DamageNumber = ({ damage, x, y, isCritical, onComplete }: DamageNumberProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`absolute pointer-events-none font-bold animate-float-up z-50 ${
        isCritical
          ? 'text-4xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse'
          : 'text-2xl text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]'
      }`}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {isCritical && '⚡'}
      {Math.floor(damage).toLocaleString()}
      {isCritical && '!'}
    </div>
  );
};
