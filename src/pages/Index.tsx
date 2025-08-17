import { useState, useEffect } from "react";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TimerControls } from "@/components/TimerControls";
import { FloatingTimer } from "@/components/FloatingTimer";
import { ScreensList } from "@/components/ScreensList";
import { useTimer } from "@/hooks/useTimer";
import { useScreens } from "@/hooks/useScreens";
import { useTimerSession } from "@/hooks/useTimerSession";

const Index = () => {
  const { timeLeft, isRunning, allowOvertime, start, pause, stop, reset, setTime, toggleOvertime } = useTimer(60);
  const [caption, setCaption] = useState("");
  const [endCaption, setEndCaption] = useState("TIME IS UP!");
  const [showFloating, setShowFloating] = useState(false);
  const [roomCode] = useState("MAIN"); // Default room code
  
  // Initialize timer session
  const { session, createSession, updateTimerState } = useTimerSession();
  const { screens, addScreen, removeScreen } = useScreens(session?.id);

  // Create session on mount
  useEffect(() => {
    createSession(roomCode);
  }, [createSession, roomCode]);

  // Sync local timer state with Supabase when changes occur
  useEffect(() => {
    if (session) {
      updateTimerState({
        time_left: timeLeft,
        is_running: isRunning,
        allow_overtime: allowOvertime,
        caption,
        end_caption: endCaption
      });
    }
  }, [timeLeft, isRunning, allowOvertime, caption, endCaption, session, updateTimerState]);

  // Update local timer from session changes (from other screens)
  useEffect(() => {
    if (session && !isRunning) {
      // Only sync from remote if we're not currently running locally
      // This prevents conflicts when the timer is actively running
      if (session.time_left !== timeLeft) {
        setTime(Math.floor(session.time_left / 60), session.time_left % 60);
      }
      if (session.caption !== caption) {
        setCaption(session.caption || "");
      }
      if (session.end_caption !== endCaption) {
        setEndCaption(session.end_caption || "TIME IS UP!");
      }
    }
  }, [session, isRunning]);

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
          <ScreensList 
            screens={screens}
            onAddScreen={addScreen}
            onRemoveScreen={removeScreen}
          />
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
