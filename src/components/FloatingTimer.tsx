import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2, X } from "lucide-react";

interface FloatingTimerProps {
  timeLeft: number;
  isRunning: boolean;
  caption: string;
  endCaption: string;
  onClose: () => void;
}

export const FloatingTimer = ({ timeLeft, isRunning, caption, endCaption, onClose }: FloatingTimerProps) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const displayCaption = timeLeft <= 0 && endCaption ? endCaption : caption;

  return (
    <div
      className="fixed bg-card border-2 border-border rounded-lg shadow-2xl z-50 min-w-[300px] max-w-[400px]"
      style={{ 
        left: position.x, 
        top: position.y,
        userSelect: isDragging ? 'none' : 'auto'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Title Bar */}
      <div
        className="bg-secondary px-3 py-2 rounded-t-lg cursor-move flex items-center justify-between"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-medium text-secondary-foreground">
          Timer - {isRunning ? 'LIVE' : 'STOPPED'}
        </span>
        <Button
          onClick={onClose}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-secondary-foreground/10"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Timer Content */}
      <div className="p-4">
        <div className={`timer-display text-4xl font-bold text-center ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};