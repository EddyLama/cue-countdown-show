import { useState } from "react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TimerControls } from "@/components/TimerControls";
import { FloatingTimer } from "@/components/FloatingTimer";
import { ScreensList } from "@/components/ScreensList";
import { useTimer } from "@/hooks/useTimer";

const Index = () => {
  const { timeLeft, isRunning, allowOvertime, start, pause, stop, reset, setTime, toggleOvertime } = useTimer(60);
  const [caption, setCaption] = useState("");
  const [endCaption, setEndCaption] = useState("TIME IS UP!");
  const [showFloating, setShowFloating] = useState(false);

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <TimerDisplay
            timeLeft={timeLeft}
            isRunning={isRunning}
            caption={caption}
            endCaption={endCaption}
          />
        </div>
        <div className="p-4 border-t border-border">
          <ScreensList />
        </div>
      </div>

      <aside className="w-80 bg-panel border-l border-border overflow-y-auto shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">TV Production Timer</h1>
          <p className="text-xs text-muted-foreground">Countdown · captions · floating timer</p>
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
            onToggleFloating={() => setShowFloating(!showFloating)}
            onToggleOvertime={toggleOvertime}
            isRunning={isRunning}
            timeLeft={timeLeft}
            caption={caption}
            endCaption={endCaption}
            allowOvertime={allowOvertime}
          />
        </div>
      </aside>

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
