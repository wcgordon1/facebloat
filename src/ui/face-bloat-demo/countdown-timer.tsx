import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  initialMinutes?: number;
  onExpire?: () => void;
}

export function CountdownTimer({ initialMinutes = 10, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft <= 300; // Last 5 minutes
  const totalSeconds = initialMinutes * 60;
  const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className={`relative px-6 py-4 rounded-xl border-2 shadow-lg ${
      isUrgent 
        ? 'bg-gradient-to-r from-red-500 to-orange-500 border-red-400 text-white animate-pulse' 
        : 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-400 text-white'
    }`}>
      {/* Warning Icon */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <AlertTriangle className={`h-6 w-6 ${isUrgent ? 'animate-bounce' : 'animate-pulse'}`} />
        <span className="text-lg font-bold tracking-wide">
          RESULTS EXPIRE:
        </span>
      </div>
      
      {/* Time Display */}
      <div className="flex items-center justify-center gap-1 mb-3">
        <div className="relative">
          <span 
            className="text-4xl md:text-5xl font-mono font-black tracking-wider"
            style={{
              animation: 'digitFlip 1s ease-in-out infinite',
              textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
