import { useState } from "react";

export interface Screen {
  id: string;
  name: string;
  connected: boolean;
  lastSeen: string;
}

export const useScreens = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [isController] = useState(true);

  const addScreen = (name: string) => {
    const newScreen = {
      id: crypto.randomUUID(),
      name,
      connected: true,
      lastSeen: new Date().toISOString()
    };

    setScreens(prev => [...prev, newScreen]);
  };

  const removeScreen = (id: string) => {
    setScreens(prev => prev.filter(s => s.id !== id));
  };

  const syncTimerState = (timerState: {
    timeLeft: number;
    isRunning: boolean;
    caption: string;
    endCaption: string;
  }) => {
    if (!isController) return;
    
    // For now, just log the timer state
    // This will be enhanced with real-time sync later
    console.log('Timer state synced:', timerState);
  };

  const loadScreens = () => {
    // Mock function for now
  };

  return {
    screens,
    isController,
    addScreen,
    removeScreen,
    syncTimerState,
    loadScreens
  };
};