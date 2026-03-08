import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useInventory } from "@/hooks/useInventory";
import { useDeals } from "@/hooks/useDeals";
import { useAttendance } from "@/hooks/useAttendance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, Users, Package, Fingerprint, TrendingUp } from "lucide-react";

const COLORS = ["hsl(210, 100%, 50%)", "hsl(168, 80%, 42%)", "hsl(262, 83%, 58%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(142, 71%, 45%)"];

export default function ReportsPage() {
  const { data: orders } = useOrders();
  const { data: clients } = useClients();
  const { data: inventory } = useInventory();
  const { data: deals } = useDeals();
  const { data: attendance } = useAttendance();

  // Sales by month
  const salesByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const month = o.date.slice(0, 7);
      map[month] = (map[month] || 0) + o.total;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, total]) => ({ month, total }));
  }, [orders]);

  // Order status distribution
  const orderStatusDist = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  // Client status
  const clientStatusDist = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [clients]);

  // Inventory by category
  const inventoryByCat = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach((i) => { map[i.category] = (map[i.category] || 0) + i.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  // Deal stages
  const dealStageDist = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    deals.forEach((d) => {
      if (!map[d.stage]) map[d.stage] = { count: 0, value: 0 };
      map[d.stage].count++;
      map[d.stage].value += d.value;
    });
    return Object.entries(map).map(([stage, { count, value }]) => ({ stage: stage.charAt(0).toUpperCase() + stage.slice(1), count, value }));
  }, [deals]);

  // Attendance by method
  const attendanceMethodDist = useMemo(() => {
    const map: Record<string, number> = {};
    attendance.forEach((a) => { map[a.method] = (map[a.method] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [attendance]);

  // Attendance by day (last 30 days)
  const attendanceByDay = useMemo(() => {
    const map: Record<string, number> = {};
    attendance.forEach((a) => { map[a.date] = (map[a.date] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([date, count]) => ({ date, count }));
  }, [attendance]);

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const totalDealValue = deals.reduce((a, d) => a + d.value, 0);

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Comprehensive business insights across all modules">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <DollarSign className="w-5 h-5 text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">${(totalRevenue / 1000).toFixed(0)}k</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <Users className="w-5 h-5 text-emerald-500 mb-1" />
          <p className="text-2xl font-bold text-foreground">{clients.length}</p>
          <p className="text-xs text-muted-foreground">Total Clients</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <TrendingUp className="w-5 h-5 text-violet-500 mb-1" />
          <p className="text-2xl font-bold text-foreground">${(totalDealValue / 1000).toFixed(0)}k</p>
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <Package className="w-5 h-5 text-amber-500 mb-1" />
          <p className="text-2xl font-bold text-foreground">{inventory.reduce((a, i) => a + i.quantity, 0)}</p>
          <p className="text-xs text-muted-foreground">Inventory Items</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <Fingerprint className="w-5 h-5 text-rose-500 mb-1" />
          <p className="text-2xl font-bold text-foreground">{attendance.length}</p>
          <p className="text-xs text-muted-foreground">Attendance Records</p>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesByMonth}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="total" stroke="hsl(210, 100%, 50%)" fill="url(#salesGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Order Status</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={orderStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {orderStatusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Deal Pipeline by Stage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dealStageDist}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]} />
                <Bar dataKey="value" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Client Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={clientStatusDist} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label>
                  {clientStatusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Inventory by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryByCat}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Daily Attendance (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(168, 80%, 42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Check-in Methods</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={attendanceMethodDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {attendanceMethodDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
