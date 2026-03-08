
-- Expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  amount numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  submitted_by text NOT NULL DEFAULT 'System',
  approved_by text,
  status text NOT NULL DEFAULT 'pending',
  receipt_url text,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete expenses" ON public.expenses FOR DELETE USING (true);

-- Leave requests table
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  leave_type text NOT NULL DEFAULT 'casual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  days integer NOT NULL DEFAULT 1,
  reason text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read leave_requests" ON public.leave_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert leave_requests" ON public.leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update leave_requests" ON public.leave_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete leave_requests" ON public.leave_requests FOR DELETE USING (true);

-- Payroll table
CREATE TABLE public.payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  month text NOT NULL,
  basic_salary numeric NOT NULL DEFAULT 0,
  allowances numeric NOT NULL DEFAULT 0,
  deductions numeric NOT NULL DEFAULT 0,
  net_salary numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  paid_on date,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read payroll" ON public.payroll FOR SELECT USING (true);
CREATE POLICY "Allow public insert payroll" ON public.payroll FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update payroll" ON public.payroll FOR UPDATE USING (true);
CREATE POLICY "Allow public delete payroll" ON public.payroll FOR DELETE USING (true);

-- Tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text DEFAULT '',
  assigned_to text,
  assigned_to_name text DEFAULT '',
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  project text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tasks" ON public.tasks FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payroll;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Updated_at triggers
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
