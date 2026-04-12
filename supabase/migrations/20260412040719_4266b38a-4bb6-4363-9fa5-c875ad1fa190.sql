
-- Custom actions table for user-created/edited actions
CREATE TABLE public.custom_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_text text NOT NULL,
  responsaveis text[] NOT NULL DEFAULT '{}',
  prazo text NOT NULL,
  area text NOT NULL,
  kr text NOT NULL,
  direcionamento text,
  is_action_plan boolean NOT NULL DEFAULT false,
  follow_up_dates text[],
  is_subtask boolean NOT NULL DEFAULT false,
  parent_action_id text,
  is_recurrent boolean NOT NULL DEFAULT false,
  chips text[],
  chip_label text,
  expectativas text[],
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view custom_actions"
  ON public.custom_actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert custom_actions"
  ON public.custom_actions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update custom_actions"
  ON public.custom_actions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete custom_actions"
  ON public.custom_actions FOR DELETE TO authenticated USING (true);

-- Spreadsheet imports table
CREATE TABLE public.spreadsheet_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  data_snapshot jsonb,
  imported_by uuid NOT NULL,
  imported_by_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spreadsheet_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view spreadsheet_imports"
  ON public.spreadsheet_imports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert spreadsheet_imports"
  ON public.spreadsheet_imports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete own spreadsheet_imports"
  ON public.spreadsheet_imports FOR DELETE TO authenticated USING (auth.uid() = imported_by);

-- Enable realtime for custom_actions
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_actions;

-- Storage bucket for spreadsheets
INSERT INTO storage.buckets (id, name, public) VALUES ('spreadsheets', 'spreadsheets', false);

CREATE POLICY "Authenticated users can upload spreadsheets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'spreadsheets');

CREATE POLICY "Authenticated users can view spreadsheets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'spreadsheets');

CREATE POLICY "Authenticated users can delete own spreadsheets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'spreadsheets');
