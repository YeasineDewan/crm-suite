
-- Employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  avatar text NOT NULL DEFAULT '',
  performance integer NOT NULL DEFAULT 80,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'prospect',
  total_spent numeric NOT NULL DEFAULT 0,
  last_contact date NOT NULL DEFAULT CURRENT_DATE,
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  client_name text NOT NULL,
  items integer NOT NULL DEFAULT 1,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  date date NOT NULL DEFAULT CURRENT_DATE,
  priority text NOT NULL DEFAULT 'medium',
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text NOT NULL,
  name text NOT NULL,
  sku text NOT NULL,
  category text NOT NULL DEFAULT 'Software',
  quantity integer NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in-stock',
  last_restocked date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth in this app)
CREATE POLICY "Allow public read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update employees" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Allow public delete employees" ON public.employees FOR DELETE USING (true);

CREATE POLICY "Allow public read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public read inventory" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert inventory" ON public.inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update inventory" ON public.inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete inventory" ON public.inventory_items FOR DELETE USING (true);

-- Updated_at triggers
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
