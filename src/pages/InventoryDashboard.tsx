import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { inventory } from "@/data/mockData";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function InventoryDashboard() {
  const inStock = inventory.filter(i => i.status === "in-stock").length;
  const lowStock = inventory.filter(i => i.status === "low-stock").length;
  const outOfStock = inventory.filter(i => i.status === "out-of-stock").length;
  const totalValue = inventory.reduce((a, i) => a + i.quantity * i.price, 0);

  const categoryData = Object.entries(
    inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value], i) => ({
    name,
    value,
    color: ["hsl(210, 100%, 50%)", "hsl(168, 80%, 42%)", "hsl(262, 83%, 58%)"][i % 3],
  }));

  return (
    <DashboardLayout title="Inventory" subtitle="Track stock levels and manage your products.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Items" value={String(inventory.length)} icon={Package} gradient="stat-gradient-blue" />
        <StatCard title="In Stock" value={String(inStock)} icon={CheckCircle} gradient="stat-gradient-green" />
        <StatCard title="Low Stock" value={String(lowStock)} change="Restock needed" changeType="negative" icon={AlertTriangle} gradient="stat-gradient-amber" />
        <StatCard title="Total Value" value={`$${(totalValue / 1000).toFixed(0)}k`} icon={DollarSign} gradient="stat-gradient-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">All Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Qty</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{item.sku}</td>
                    <td className="px-5 py-3 text-foreground">{item.category}</td>
                    <td className="px-5 py-3 text-foreground">{item.quantity}</td>
                    <td className="px-5 py-3 text-foreground font-medium">${item.price.toLocaleString()}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
