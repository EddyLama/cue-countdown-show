import { useState } from "react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TimerControls } from "@/components/TimerControls";
import { FloatingTimer } from "@/components/FloatingTimer";
import { useTimer } from "@/hooks/useTimer";

const Index = () => {
  const { timeLeft, isRunning, start, pause, stop, reset, setTime } = useTimer(60);
  const [caption, setCaption] = useState("");
  const [endCaption, setEndCaption] = useState("TIME IS UP!");
  const [showFloating, setShowFloating] = useState(false);

  const toggleFloating = () => {
    setShowFloating(!showFloating);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Timer Display - Full Screen */}
      <div className="flex-1">
        <TimerDisplay 
          timeLeft={timeLeft}
          isRunning={isRunning}
          caption={caption}
          endCaption={endCaption}
        />
      </div>

      {/* Control Panel - Side Panel */}
      <div className="w-80 bg-card border-l border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">
            TV Production Timer
          </h1>
          <p className="text-sm text-muted-foreground">
            Professional broadcast control
          </p>
        </div>
        
        <div className="p-4">
          <TimerControls
            onStart={start}
            onPause={pause}
            onStop={stop}
            onReset={reset}
            onSetTime={setTime}
            onSetCaption={setCaption}
            onSetEndCaption={setEndCaption}
            onToggleFloating={toggleFloating}
            isRunning={isRunning}
            timeLeft={timeLeft}
            caption={caption}
            endCaption={endCaption}
          />
        </div>
      </div>

      {/* Floating Timer Window */}
      {showFloating && (
        <FloatingTimer
          timeLeft={timeLeft}
          isRunning={isRunning}
          caption={caption}
          endCaption={endCaption}
          onClose={() => setShowFloating(false)}
        />
      )}
    </div>
  );
};

export default Index;
