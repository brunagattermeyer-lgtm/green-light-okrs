
-- Create action_states table
CREATE TABLE public.action_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id TEXT NOT NULL UNIQUE,
  is_done BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create chip_states table
CREATE TABLE public.chip_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chip_key TEXT NOT NULL UNIQUE,
  is_done BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.action_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chip_states ENABLE ROW LEVEL SECURITY;

-- RLS policies: all authenticated users can read/write
CREATE POLICY "Authenticated users can read action_states"
  ON public.action_states FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert action_states"
  ON public.action_states FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update action_states"
  ON public.action_states FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read chip_states"
  ON public.chip_states FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert chip_states"
  ON public.chip_states FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update chip_states"
  ON public.chip_states FOR UPDATE TO authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chip_states;
