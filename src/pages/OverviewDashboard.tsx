import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Users, ShoppingCart, Package, TrendingUp, ArrowUpRight, Shield, Eye } from "lucide-react";
import { revenueData, orders, clients, employees, inventory } from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = [
  "hsl(210, 100%, 50%)", "hsl(168, 80%, 42%)", "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)",
];

export default function OverviewDashboard() {
  const { displayName, roles, hasRole } = useAuth();
  const isEmployee = !hasRole("admin") && !hasRole("manager");

  // Filter data based on role
  const filteredClients = useMemo(() => {
    if (!isEmployee) return clients;
    return clients.filter((c) => c.assignedTo === displayName);
  }, [isEmployee, displayName]);

  const filteredOrders = useMemo(() => {
    if (!isEmployee) return orders;
    return orders.filter((o) => o.assignedTo === displayName);
  }, [isEmployee, displayName]);

  const recentOrders = filteredOrders.slice(0, 5);
  const topClients = filteredClients
    .filter((c) => c.status === "active")
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const totalRevenue = filteredOrders.reduce((a, o) => a + o.total, 0);
  const activeClients = filteredClients.filter((c) => c.status === "active").length;
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending").length;

  // Order status breakdown for pie chart
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [filteredOrders]);

  // Revenue by client for bar chart
  const clientRevenueData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      map[o.clientName] = (map[o.clientName] || 0) + o.total;
    });
    return Object.entries(map)
      .map(([client, revenue]) => ({ client, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filteredOrders]);

  const roleLabel = roles.length > 0 ? roles[0].charAt(0).toUpperCase() + roles[0].slice(1) : "Employee";

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      {/* Role indicator */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5 border border-border">
          {isEmployee ? <Eye className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
          Viewing as <span className="text-foreground font-semibold">{roleLabel}</span>
          {isEmployee && (
            <span className="text-muted-foreground ml-1">— showing your assigned data only</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={isEmployee ? "Your Revenue" : "Total Revenue"}
          value={`$${(totalRevenue / 1000).toFixed(0)}k`}
          change={isEmployee ? `${filteredOrders.length} orders` : "+12.5% from last month"}
          changeType="positive"
          icon={DollarSign}
          gradient="stat-gradient-blue"
        />
        <StatCard
          title={isEmployee ? "Your Clients" : "Active Clients"}
          value={String(activeClients)}
          change={isEmployee ? `${filteredClients.length} total assigned` : "+3 new this month"}
          changeType="positive"
          icon={Users}
          gradient="stat-gradient-green"
        />
        <StatCard
          title="Pending Orders"
          value={String(pendingOrders)}
          change={`${filteredOrders.filter((o) => o.priority === "high").length} high priority`}
          changeType={pendingOrders > 0 ? "negative" : "neutral"}
          icon={ShoppingCart}
          gradient="stat-gradient-purple"
        />
        <StatCard
          title={isEmployee ? "Delivered" : "Inventory Items"}
          value={isEmployee ? String(filteredOrders.filter((o) => o.status === "delivered").length) : String(inventory.reduce((a, i) => a + i.quantity, 0))}
          change={isEmployee ? "completed orders" : `${inventory.filter((i) => i.status === "low-stock").length} low stock`}
          changeType={isEmployee ? "positive" : "negative"}
          icon={isEmployee ? TrendingUp : Package}
          gradient="stat-gradient-amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue chart - admins/managers see trend, employees see per-client breakdown */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                {isEmployee ? "Revenue by Client" : "Revenue Overview"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEmployee ? "Your assigned client revenue" : "Monthly revenue trend"}
              </p>
            </div>
            {!isEmployee && (
              <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" /> +12.5%
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {isEmployee ? (
              <BarChart data={clientRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="client" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(210, 100%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
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
            )}
          </ResponsiveContainer>
        </div>

        {/* Order status pie chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-1">
            {isEmployee ? "Your Order Status" : "Order Status"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {isEmployee ? "Breakdown of your assigned orders" : "All orders by status"}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
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

      {/* Admin/Manager extra: orders by month bar chart */}
      {!isEmployee && (
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
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              {isEmployee ? "Your Recent Orders" : "Recent Orders"}
            </h3>
            <a href="/orders" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No orders assigned to you yet.</p>
            )}
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
            <h3 className="font-semibold text-foreground">
              {isEmployee ? "Your Top Clients" : "Top Clients"}
            </h3>
            <a href="/clients" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {topClients.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No clients assigned to you yet.</p>
            )}
            {topClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {client.name.split(" ").map((w) => w[0]).join("")}
                    </span>
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
