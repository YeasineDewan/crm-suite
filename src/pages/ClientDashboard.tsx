import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Building2, UserPlus, DollarSign, Clock } from "lucide-react";
import { clients } from "@/data/mockData";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ClientDashboard() {
  const active = clients.filter(c => c.status === "active").length;
  const prospects = clients.filter(c => c.status === "prospect").length;
  const totalRevenue = clients.reduce((a, c) => a + c.totalSpent, 0);

  const statusData = [
    { name: "Active", value: active, color: "hsl(152, 69%, 41%)" },
    { name: "Prospect", value: prospects, color: "hsl(210, 100%, 50%)" },
    { name: "Inactive", value: clients.filter(c => c.status === "inactive").length, color: "hsl(220, 10%, 46%)" },
  ];

  return (
    <DashboardLayout title="Clients" subtitle="Manage your client relationships and revenue.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Clients" value={String(clients.length)} icon={Building2} gradient="stat-gradient-blue" />
        <StatCard title="Active Clients" value={String(active)} change="+2 this month" changeType="positive" icon={UserPlus} gradient="stat-gradient-green" />
        <StatCard title="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} gradient="stat-gradient-purple" />
        <StatCard title="Prospects" value={String(prospects)} change="Follow up needed" changeType="neutral" icon={Clock} gradient="stat-gradient-amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Client Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">All Clients</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Total Spent</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={client.status} /></td>
                    <td className="px-5 py-3 text-foreground font-medium">${client.totalSpent.toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{client.lastContact}</td>
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
