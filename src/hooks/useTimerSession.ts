import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TimerSession = Database['public']['Tables']['timer_sessions']['Row'];

export const useTimerSession = (roomCode?: string) => {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Create or join a session
  const createSession = useCallback(async (code: string) => {
    setLoading(true);
    try {
      // Check if session already exists
      const { data: existingSession } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('room_code', code)
        .maybeSingle();

      if (existingSession) {
        setSession(existingSession);
        return existingSession;
      }

      // Create new session
      const { data, error } = await supabase
        .from('timer_sessions')
        .insert({
          room_code: code,
          time_left: 300, // 5 minutes default
          initial_time: 300,
          is_running: false,
          allow_overtime: false,
          caption: '',
          end_caption: 'TIME IS UP!'
        })
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update timer state
  const updateTimerState = useCallback(async (updates: Partial<TimerSession>) => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error updating timer state:', error);
    }
  }, [session]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`timer_session_${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'timer_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          setSession(payload.new as TimerSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Load session by room code
  useEffect(() => {
    if (!roomCode) return;

    const loadSession = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('timer_sessions')
          .select('*')
          .eq('room_code', roomCode)
          .maybeSingle();

        if (error) throw error;
        if (data) setSession(data);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [roomCode]);

  return {
    session,
    loading,
    createSession,
    updateTimerState
  };
};