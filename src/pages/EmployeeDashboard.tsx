import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { employees, departmentData } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function EmployeeDashboard() {
  const active = employees.filter(e => e.status === "active").length;
  const onLeave = employees.filter(e => e.status === "on-leave").length;
  const avgPerformance = Math.round(employees.reduce((a, e) => a + e.performance, 0) / employees.length);

  return (
    <DashboardLayout title="Employees" subtitle="Manage your team members and their performance.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Employees" value={String(employees.length)} change="+2 this quarter" changeType="positive" icon={Users} gradient="stat-gradient-blue" />
        <StatCard title="Active" value={String(active)} icon={UserCheck} gradient="stat-gradient-green" />
        <StatCard title="On Leave" value={String(onLeave)} icon={Clock} gradient="stat-gradient-amber" />
        <StatCard title="Avg Performance" value={`${avgPerformance}%`} change="+3% from last quarter" changeType="positive" icon={UserX} gradient="stat-gradient-purple" />
      </div>

      {/* Department chart */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Employees by Department</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={departmentData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} width={90} />
            <Tooltip />
            <Bar dataKey="employees" radius={[0, 4, 4, 0]}>
              {departmentData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Employee table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">All Employees</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Department</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Performance</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{emp.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-foreground">{emp.role}</td>
                  <td className="px-5 py-3 text-foreground">{emp.department}</td>
                  <td className="px-5 py-3"><StatusBadge status={emp.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${emp.performance}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{emp.performance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
