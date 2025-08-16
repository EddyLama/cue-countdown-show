import { useEffect, useState } from "react";

interface TimerDisplayProps {
  timeLeft: number;
  isRunning: boolean;
  caption: string;
}

export const TimerDisplay = ({ timeLeft, isRunning, caption }: TimerDisplayProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? "-" : "";
    
    return `${sign}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (): string => {
    if (!isRunning) return "text-timer-stopped";
    if (timeLeft <= 0) return "text-timer-critical";
    if (timeLeft <= 10) return "text-timer-critical";
    if (timeLeft <= 30) return "text-timer-warning";
    return "text-timer-active";
  };

  const getStatusClass = (): string => {
    if (!isRunning) return "";
    if (timeLeft <= 10) return "status-active";
    return "";
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      {/* Current Time Display */}
      <div className="absolute top-4 right-4 text-muted-foreground text-lg font-mono">
        {currentTime.toLocaleTimeString()}
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div 
            className={`timer-display text-[12rem] leading-none ${getTimerColor()} ${getStatusClass()} timer-glow`}
          >
            {formatTime(timeLeft)}
          </div>
          
          {/* Caption Overlay */}
          {caption && (
            <div className="mt-8 px-8 py-4 bg-black/50 rounded-lg backdrop-blur-sm">
              <div className="caption-overlay text-2xl font-bold text-white text-center">
                {caption}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-16 bg-card border-t border-border flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-primary' : 'bg-muted'}`} />
          <span className="text-sm font-medium">
            {isRunning ? 'LIVE' : 'STOPPED'}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          TV Production Timer
        </div>
      </div>
    </div>
  );
};