import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, SortableHeader } from "@/components/TableToolbar";
import { Pagination } from "@/components/Pagination";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { DeleteDialog } from "@/components/forms/DeleteDialog";
import { useDataTable } from "@/hooks/useDataTable";
import { useEmployees } from "@/hooks/useEmployees";
import { Users, UserCheck, Clock, TrendingUp, Plus, Pencil, Trash2 } from "lucide-react";
import { departmentData, type Employee } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";
import { exportToCSV } from "@/lib/csvExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function EmployeeDashboard() {
  const { data, isLoading, upsert, remove } = useEmployees();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [deleteItem, setDeleteItem] = useState<Employee | null>(null);

  const table = useDataTable({ data, searchFields: ["name", "email", "role", "department"], defaultSort: "name" });

  const active = data.filter(e => e.status === "active").length;
  const onLeave = data.filter(e => e.status === "on-leave").length;
  const avgPerf = data.length ? Math.round(data.reduce((a, e) => a + e.performance, 0) / data.length) : 0;

  const handleSave = (emp: Employee) => {
    upsert.mutate(emp);
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) remove.mutate(deleteItem.id);
    setDeleteItem(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Employees" subtitle="Manage your team members and their performance.">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employees" subtitle="Manage your team members and their performance.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Employees" value={String(data.length)} change="+2 this quarter" changeType="positive" icon={Users} gradient="stat-gradient-blue" />
        <StatCard title="Active" value={String(active)} icon={UserCheck} gradient="stat-gradient-green" />
        <StatCard title="On Leave" value={String(onLeave)} icon={Clock} gradient="stat-gradient-amber" />
        <StatCard title="Avg Performance" value={`${avgPerf}%`} change="+3% from last quarter" changeType="positive" icon={TrendingUp} gradient="stat-gradient-purple" />
      </div>

      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Employees by Department</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={departmentData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} width={90} />
            <Tooltip />
            <Bar dataKey="employees" radius={[0, 4, 4, 0]}>
              {departmentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Search employees...">
            <ExportButton
              onExportAll={() => exportToCSV(data, "employees", [
                { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "email", label: "Email" },
                { key: "role", label: "Role" }, { key: "department", label: "Department" }, { key: "status", label: "Status" },
                { key: "performance", label: "Performance" }, { key: "joinDate", label: "Join Date" },
              ])}
              onExportFiltered={() => exportToCSV(table.filtered, "employees_filtered", [
                { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "email", label: "Email" },
                { key: "role", label: "Role" }, { key: "department", label: "Department" }, { key: "status", label: "Status" },
                { key: "performance", label: "Performance" }, { key: "joinDate", label: "Join Date" },
              ])}
              filteredCount={table.filtered.length}
            />
            <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Employee
            </Button>
          </TableToolbar>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <SortableHeader label="Employee" sortKey="name" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Employee)} />
                <SortableHeader label="Role" sortKey="role" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Employee)} />
                <SortableHeader label="Department" sortKey="department" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Employee)} />
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <SortableHeader label="Performance" sortKey="performance" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Employee)} />
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {table.paginated.map((emp) => (
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
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditItem(emp); setFormOpen(true); }} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => setDeleteItem(emp)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPageChange={table.setPage} />
      </div>

      <EmployeeForm open={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} onSave={handleSave} employee={editItem} />
      <DeleteDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Employee" description={`Are you sure you want to remove ${deleteItem?.name}?`} />
    </DashboardLayout>
  );
}
