
-- Activity log table
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- 'client', 'order', 'employee', 'inventory'
  entity_id text NOT NULL,
  action text NOT NULL, -- 'created', 'updated', 'deleted'
  description text NOT NULL DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read activity_log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity_log" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Index for fast queries
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
