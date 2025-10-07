import { useEffect, useState } from 'react';
import pumpkinImage from '@/assets/pumpkin.png';
import { Progress } from '@/components/ui/progress';

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-primary/10">
      <div className="relative">
        {/* Animated pumpkin */}
        <img
          src={pumpkinImage}
          alt="Loading"
          className="w-32 h-32 animate-bounce drop-shadow-2xl"
          style={{
            animation: 'bounce 1s infinite, spin 3s linear infinite',
          }}
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="mt-8 space-y-4 w-64">
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Loading Game...
        </h2>
        
        <Progress value={progress} className="h-2" />
        
        <p className="text-sm text-muted-foreground text-center animate-pulse">
          Preparing your adventure
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
