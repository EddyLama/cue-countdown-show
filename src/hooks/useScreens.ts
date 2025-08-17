import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface Screen {
  id: string;
  name: string;
  connected: boolean;
  lastSeen: string;
}

export const useScreens = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [isController, setIsController] = useState(true);

  useEffect(() => {
    // Subscribe to screens changes
    const channel = supabase
      .channel('screens')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'screens'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setScreens(prev => [...prev, payload.new as Screen]);
        } else if (payload.eventType === 'DELETE') {
          setScreens(prev => prev.filter(s => s.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setScreens(prev => prev.map(s => 
            s.id === payload.new.id ? payload.new as Screen : s
          ));
        }
      })
      .subscribe();

    // Load initial screens
    loadScreens();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadScreens = async () => {
    const { data, error } = await supabase
      .from('screens')
      .select('*')
      .order('name');
    
    if (data && !error) {
      setScreens(data);
    }
  };

  const addScreen = async (name: string) => {
    const newScreen = {
      id: crypto.randomUUID(),
      name,
      connected: true,
      lastSeen: new Date().toISOString()
    };

    const { error } = await supabase
      .from('screens')
      .insert([newScreen]);

    if (error) {
      console.error('Error adding screen:', error);
    }
  };

  const removeScreen = async (id: string) => {
    const { error } = await supabase
      .from('screens')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing screen:', error);
    }
  };

  const syncTimerState = async (timerState: {
    timeLeft: number;
    isRunning: boolean;
    caption: string;
    endCaption: string;
  }) => {
    if (!isController) return;

    const { error } = await supabase
      .from('timer_state')
      .upsert([{
        id: 'main',
        ...timerState,
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error syncing timer state:', error);
    }
  };

  return {
    screens,
    isController,
    setIsController,
    addScreen,
    removeScreen,
    syncTimerState,
    loadScreens
  };
};