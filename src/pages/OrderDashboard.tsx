import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";
import { orders, revenueData } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function OrderDashboard() {
  const pending = orders.filter(o => o.status === "pending").length;
  const processing = orders.filter(o => o.status === "processing").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const totalValue = orders.reduce((a, o) => a + o.total, 0);

  return (
    <DashboardLayout title="Orders" subtitle="Track and manage all customer orders.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Orders" value={String(orders.length)} icon={ShoppingCart} gradient="stat-gradient-blue" />
        <StatCard title="Pending" value={String(pending)} change={`${orders.filter(o => o.status === "pending" && o.priority === "high").length} high priority`} changeType="negative" icon={Clock} gradient="stat-gradient-amber" />
        <StatCard title="In Transit" value={String(processing + orders.filter(o => o.status === "shipped").length)} icon={Truck} gradient="stat-gradient-purple" />
        <StatCard title="Delivered" value={String(delivered)} change={`$${totalValue.toLocaleString()} total`} changeType="positive" icon={CheckCircle} gradient="stat-gradient-green" />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Order Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="hsl(262, 83%, 58%)" strokeWidth={2} dot={{ fill: "hsl(262, 83%, 58%)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">All Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Order ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Items</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{order.id}</td>
                  <td className="px-5 py-3 text-foreground">{order.clientName}</td>
                  <td className="px-5 py-3 text-foreground">{order.items}</td>
                  <td className="px-5 py-3 text-foreground font-medium">${order.total.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3"><StatusBadge status={order.priority} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
