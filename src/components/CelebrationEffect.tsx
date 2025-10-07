import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationEffectProps {
  trigger: boolean;
  type?: 'level' | 'achievement' | 'reward' | 'epic';
}

export const CelebrationEffect = ({ trigger, type = 'reward' }: CelebrationEffectProps) => {
  useEffect(() => {
    if (!trigger) return;

    const configs = {
      level: {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      },
      achievement: {
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#9b59b6', '#3498db', '#e74c3c', '#f39c12']
      },
      reward: {
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6']
      },
      epic: {
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FF1493', '#00CED1', '#FF6347'],
        startVelocity: 45,
        ticks: 200,
        gravity: 0.5
      }
    };

    const config = configs[type];

    // Fire confetti
    confetti({
      ...config,
      decay: 0.9,
      scalar: 1.2,
    });

    // For epic celebrations, add extra bursts
    if (type === 'epic') {
      setTimeout(() => confetti({
        ...config,
        origin: { x: 0.3, y: 0.5 }
      }), 200);
      
      setTimeout(() => confetti({
        ...config,
        origin: { x: 0.7, y: 0.5 }
      }), 400);
    }
  }, [trigger, type]);

  return null;
};
