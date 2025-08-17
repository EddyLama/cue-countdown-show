-- Create timer_sessions table for storing timer state
CREATE TABLE public.timer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  time_left INTEGER NOT NULL DEFAULT 0,
  initial_time INTEGER NOT NULL DEFAULT 0,
  is_running BOOLEAN NOT NULL DEFAULT false,
  allow_overtime BOOLEAN NOT NULL DEFAULT false,
  caption TEXT DEFAULT '',
  end_caption TEXT DEFAULT 'TIME IS UP!',
  controller_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create screens table for tracking connected screens
CREATE TABLE public.screens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.timer_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  connected BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;

-- Create policies for timer_sessions (public access for now, can be restricted later)
CREATE POLICY "Anyone can view timer sessions" 
ON public.timer_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create timer sessions" 
ON public.timer_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update timer sessions" 
ON public.timer_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete timer sessions" 
ON public.timer_sessions 
FOR DELETE 
USING (true);

-- Create policies for screens
CREATE POLICY "Anyone can view screens" 
ON public.screens 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create screens" 
ON public.screens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update screens" 
ON public.screens 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete screens" 
ON public.screens 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_timer_sessions_updated_at
  BEFORE UPDATE ON public.timer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.timer_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.screens;

-- Set replica identity for realtime updates
ALTER TABLE public.timer_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.screens REPLICA IDENTITY FULL;