import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, RotateCcw, Minimize2 } from "lucide-react";

interface TimerControlsProps {
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onSetTime: (minutes: number, seconds: number) => void;
  onSetCaption: (caption: string) => void;
  onSetEndCaption: (endCaption: string) => void;
  onToggleFloating: () => void;
  isRunning: boolean;
  timeLeft: number;
  caption: string;
  endCaption: string;
}

export const TimerControls = ({
  onStart,
  onPause,
  onStop,
  onReset,
  onSetTime,
  onSetCaption,
  onSetEndCaption,
  onToggleFloating,
  isRunning,
  timeLeft,
  caption,
  endCaption
}: TimerControlsProps) => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const handleSetTime = () => {
    onSetTime(minutes, seconds);
  };

  const handlePresetTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    setMinutes(mins);
    setSeconds(secs);
    onSetTime(mins, secs);
  };

  const formatDisplayTime = (totalSeconds: number): string => {
    const mins = Math.floor(Math.abs(totalSeconds) / 60);
    const secs = Math.abs(totalSeconds) % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Caption Inputs */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-sm font-medium">
              Live Caption
            </Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => onSetCaption(e.target.value)}
              placeholder="Enter caption text..."
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endCaption" className="text-sm font-medium">
              End Caption (shown when timer reaches zero)
            </Label>
            <Input
              id="endCaption"
              value={endCaption}
              onChange={(e) => onSetEndCaption(e.target.value)}
              placeholder="TIME IS UP!"
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>

        {/* Time Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Timer Settings</Label>
          
          {/* Current Time Display */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-mono font-bold text-foreground">
              {formatDisplayTime(timeLeft)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Current Timer
            </div>
          </div>

          {/* Manual Time Input */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minutes" className="text-xs">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="999"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seconds" className="text-xs">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                className="bg-input border-border"
              />
            </div>
          </div>

          <Button onClick={handleSetTime} variant="outline" className="w-full control-button">
            Set Timer
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handlePresetTime(10)}
              variant="outline"
              size="sm"
              className="control-button"
            >
              10s
            </Button>
            <Button
              onClick={() => handlePresetTime(30)}
              variant="outline"
              size="sm"
              className="control-button"
            >
              30s
            </Button>
            <Button
              onClick={() => handlePresetTime(60)}
              variant="outline"
              size="sm"
              className="control-button"
            >
              1m
            </Button>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Timer Controls</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={isRunning ? onPause : onStart}
              className={`control-button ${isRunning ? 'bg-warning hover:bg-warning/90' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>

            <Button
              onClick={onStop}
              variant="destructive"
              className="control-button"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full control-button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button
            onClick={onToggleFloating}
            variant="secondary"
            className="w-full control-button"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Floating Window
          </Button>
        </div>
      </div>
    </Card>
  );
};