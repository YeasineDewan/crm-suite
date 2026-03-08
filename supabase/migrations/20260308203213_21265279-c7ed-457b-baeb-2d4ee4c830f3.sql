
-- Attendance table
CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  clock_in timestamptz,
  clock_out timestamptz,
  date date NOT NULL DEFAULT CURRENT_DATE,
  latitude double precision,
  longitude double precision,
  method text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'present',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete attendance" ON public.attendance FOR DELETE USING (true);

-- Office events table
CREATE TABLE public.office_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  event_type text NOT NULL DEFAULT 'meeting',
  created_by text DEFAULT 'System',
  color text DEFAULT '#3b82f6',
  all_day boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.office_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read office_events" ON public.office_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert office_events" ON public.office_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update office_events" ON public.office_events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete office_events" ON public.office_events FOR DELETE USING (true);

-- Deals / Sales pipeline table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id text NOT NULL UNIQUE,
  title text NOT NULL,
  client_name text NOT NULL DEFAULT '',
  value numeric NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'lead',
  probability integer NOT NULL DEFAULT 10,
  expected_close_date date,
  assigned_to text,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read deals" ON public.deals FOR SELECT USING (true);
CREATE POLICY "Allow public insert deals" ON public.deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update deals" ON public.deals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete deals" ON public.deals FOR DELETE USING (true);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.office_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;

-- Updated_at triggers
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_office_events_updated_at BEFORE UPDATE ON public.office_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
