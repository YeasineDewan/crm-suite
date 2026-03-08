
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  content text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT 'System',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert notes" ON public.notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete notes" ON public.notes FOR DELETE USING (true);
