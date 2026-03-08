import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign, Users, ShoppingCart, Package, TrendingUp, ArrowUpRight } from "lucide-react";
import { revenueData } from "@/data/mockData";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useInventory } from "@/hooks/useInventory";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = [
  "hsl(210, 100%, 50%)", "hsl(168, 80%, 42%)", "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)",
];

export default function OverviewDashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();

  const isLoading = ordersLoading || clientsLoading || inventoryLoading;

  const recentOrders = orders.slice(0, 5);
  const topClients = clients
    .filter((c) => c.status === "active")
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const activeClients = clients.filter((c) => c.status === "active").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  const clientRevenueData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      map[o.clientName] = (map[o.clientName] || 0) + o.total;
    });
    return Object.entries(map)
      .map(([client, revenue]) => ({ client, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders]);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}k`} change="+12.5% from last month" changeType="positive" icon={DollarSign} gradient="stat-gradient-blue" />
        <StatCard title="Active Clients" value={String(activeClients)} change="+3 new this month" changeType="positive" icon={Users} gradient="stat-gradient-green" />
        <StatCard title="Pending Orders" value={String(pendingOrders)} change={`${orders.filter((o) => o.priority === "high").length} high priority`} changeType={pendingOrders > 0 ? "negative" : "neutral"} icon={ShoppingCart} gradient="stat-gradient-purple" />
        <StatCard title="Inventory Items" value={String(inventory.reduce((a, i) => a + i.quantity, 0))} change={`${inventory.filter((i) => i.status === "low-stock").length} low stock`} changeType="negative" icon={Package} gradient="stat-gradient-amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
              <TrendingUp className="w-4 h-4" /> +12.5%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(210, 100%, 50%)" fill="url(#revenueGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-1">Order Status</h3>
          <p className="text-xs text-muted-foreground mb-4">All orders by status</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {orderStatusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by Month */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-1">Orders by Month</h3>
        <p className="text-xs text-muted-foreground mb-4">Number of orders placed</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip />
            <Bar dataKey="orders" fill="hsl(168, 80%, 42%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Orders</h3>
            <a href="/orders" className="text-xs text-primary flex items-center gap-1 hover:underline">View all <ArrowUpRight className="w-3 h-3" /></a>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.clientName}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-foreground">${order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Top Clients</h3>
            <a href="/clients" className="text-xs text-primary flex items-center gap-1 hover:underline">View all <ArrowUpRight className="w-3 h-3" /></a>
          </div>
          <div className="space-y-3">
            {topClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{client.name.split(" ").map((w) => w[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.company}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">${client.totalSpent.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
