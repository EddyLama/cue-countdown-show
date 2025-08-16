import { useState, useEffect, useRef, useCallback } from "react";

export const useTimer = (initialTime: number = 0) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTimeSet, setInitialTimeSet] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertRef = useRef<number>(-1);

  const playAlert = useCallback((type: 'warning' | 'critical' | 'end') => {
    // Create audio alerts for different timer states
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    switch (type) {
      case 'warning':
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
        break;
      case 'critical':
        oscillator.frequency.setValueAtTime(1000, context.currentTime);
        gainNode.gain.setValueAtTime(0.5, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
        setTimeout(() => {
          const osc2 = context.createOscillator();
          const gain2 = context.createGain();
          osc2.connect(gain2);
          gain2.connect(context.destination);
          osc2.frequency.setValueAtTime(1000, context.currentTime);
          gain2.gain.setValueAtTime(0.5, context.currentTime);
          osc2.start();
          osc2.stop(context.currentTime + 0.1);
        }, 150);
        break;
      case 'end':
        oscillator.frequency.setValueAtTime(400, context.currentTime);
        gainNode.gain.setValueAtTime(0.7, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 1);
        break;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Audio alerts
          if (newTime === 30 && lastAlertRef.current !== 30) {
            playAlert('warning');
            lastAlertRef.current = 30;
          } else if (newTime === 10 && lastAlertRef.current !== 10) {
            playAlert('critical');
            lastAlertRef.current = 10;
          } else if (newTime === 0 && lastAlertRef.current !== 0) {
            playAlert('end');
            lastAlertRef.current = 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, playAlert]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialTimeSet);
    lastAlertRef.current = -1;
  }, [initialTimeSet]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialTimeSet);
    lastAlertRef.current = -1;
  }, [initialTimeSet]);

  const setTime = useCallback((minutes: number, seconds: number) => {
    const totalSeconds = minutes * 60 + seconds;
    setTimeLeft(totalSeconds);
    setInitialTimeSet(totalSeconds);
    setIsRunning(false);
    lastAlertRef.current = -1;
  }, []);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    stop,
    reset,
    setTime
  };
};