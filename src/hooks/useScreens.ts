import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Screen = Database['public']['Tables']['screens']['Row'];

export const useScreens = (sessionId?: string) => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(false);

  // Add a new screen to the session
  const addScreen = useCallback(async (name: string) => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('screens')
        .insert({
          session_id: sessionId,
          name,
          connected: true,
          last_seen: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Local state will be updated by realtime subscription
    } catch (error) {
      console.error('Error adding screen:', error);
    }
  }, [sessionId]);

  // Remove a screen
  const removeScreen = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('screens')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Local state will be updated by realtime subscription
    } catch (error) {
      console.error('Error removing screen:', error);
    }
  }, []);

  // Load screens for the session
  const loadScreens = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setScreens(data || []);
    } catch (error) {
      console.error('Error loading screens:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Subscribe to real-time updates for screens
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`screens_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'screens',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setScreens(prev => [...prev, payload.new as Screen]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'screens',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setScreens(prev => prev.filter(screen => screen.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'screens',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setScreens(prev => prev.map(screen => 
            screen.id === payload.new.id ? payload.new as Screen : screen
          ));
        }
      )
      .subscribe();

    // Load initial data
    loadScreens();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, loadScreens]);

  return {
    screens,
    loading,
    addScreen,
    removeScreen,
    loadScreens
  };
};