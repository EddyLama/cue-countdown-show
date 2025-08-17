import { useState, useEffect } from "react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TimerControls } from "@/components/TimerControls";
import { FloatingTimer } from "@/components/FloatingTimer";
import { ScreensList } from "@/components/ScreensList";
import { useTimer } from "@/hooks/useTimer";
import { useScreens } from "@/hooks/useScreens";

const Index = () => {
  const { timeLeft, isRunning, allowOvertime, start, pause, stop, reset, setTime, toggleOvertime } = useTimer(60);
  const { syncTimerState } = useScreens();
  const [caption, setCaption] = useState("");
  const [endCaption, setEndCaption] = useState("TIME IS UP!");
  const [showFloating, setShowFloating] = useState(false);

  // Sync timer state to all connected screens
  useEffect(() => {
    syncTimerState({ timeLeft, isRunning, caption, endCaption });
  }, [timeLeft, isRunning, caption, endCaption, syncTimerState]);

  const toggleFloating = () => {
    setShowFloating(!showFloating);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Timer Display - Full Screen */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <TimerDisplay 
            timeLeft={timeLeft}
            isRunning={isRunning}
            caption={caption}
            endCaption={endCaption}
          />
        </div>
        
        {/* Screens List in bottom area */}
        <div className="p-4 border-t border-border">
          <ScreensList />
        </div>
      </div>

      {/* Control Panel - Side Panel */}
      <div className="w-80 bg-card border-l border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">
            TV Production Timer
          </h1>
          <p className="text-sm text-muted-foreground">
            Professional broadcast control by Ohriginal LLC ©2025
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
            onToggleOvertime={toggleOvertime}
            isRunning={isRunning}
            timeLeft={timeLeft}
            caption={caption}
            endCaption={endCaption}
            allowOvertime={allowOvertime}
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
