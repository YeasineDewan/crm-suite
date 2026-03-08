import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, SortableHeader } from "@/components/TableToolbar";
import { Pagination } from "@/components/Pagination";
import { FilterBar } from "@/components/FilterBar";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { DeleteDialog } from "@/components/forms/DeleteDialog";
import { useDataTable } from "@/hooks/useDataTable";
import { useEmployees } from "@/hooks/useEmployees";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Users, UserCheck, Clock, TrendingUp, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { departmentData, type Employee } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";
import { exportToCSV } from "@/lib/csvExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

const CSV_COLS = [
  { key: "id" as const, label: "ID" }, { key: "name" as const, label: "Name" }, { key: "email" as const, label: "Email" },
  { key: "role" as const, label: "Role" }, { key: "department" as const, label: "Department" }, { key: "status" as const, label: "Status" },
  { key: "performance" as const, label: "Performance" }, { key: "joinDate" as const, label: "Join Date" },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, upsert, remove } = useEmployees();
  const { log } = useActivityLog();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [deleteItem, setDeleteItem] = useState<Employee | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const departments = [...new Set(data.map((e) => e.department))].filter(Boolean);
  const statuses = [...new Set(data.map((e) => e.status))];

  const table = useDataTable({
    data,
    searchFields: ["name", "email", "role", "department"],
    defaultSort: "name",
    filterableFields: [
      { key: "status", values: statuses },
      { key: "department", values: departments },
    ],
  });

  const active = data.filter(e => e.status === "active").length;
  const onLeave = data.filter(e => e.status === "on-leave").length;
  const avgPerf = data.length ? Math.round(data.reduce((a, e) => a + e.performance, 0) / data.length) : 0;

  const handleSave = (emp: Employee) => {
    const isNew = !editItem;
    upsert.mutate(emp);
    log.mutate({ entityType: "employee", entityId: emp.id, action: isNew ? "created" : "updated", description: `${isNew ? "Created" : "Updated"} employee ${emp.name}` });
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) {
      remove.mutate(deleteItem.id);
      log.mutate({ entityType: "employee", entityId: deleteItem.id, action: "deleted", description: `Deleted employee ${deleteItem.name}` });
    }
    setDeleteItem(null);
  };

  const handleBulkDelete = () => {
    table.selectedIds.forEach((id) => {
      remove.mutate(id);
      log.mutate({ entityType: "employee", entityId: id, action: "deleted", description: `Bulk deleted employee ${id}` });
    });
    table.clearSelection();
    setBulkDeleteOpen(false);
    toast.success(`Deleted ${table.selectedIds.size} employees`);
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
        <div className="p-5 border-b border-border space-y-3">
          <TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Search employees...">
            <ExportButton onExportAll={() => exportToCSV(data, "employees", CSV_COLS)} onExportFiltered={() => exportToCSV(table.filtered, "employees_filtered", CSV_COLS)} filteredCount={table.filtered.length} />
            <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Employee
            </Button>
          </TableToolbar>
          <FilterBar filters={table.filterOptions} activeFilters={table.activeFilters} onFilterChange={table.setFilter} onClearAll={table.clearFilters} />
        </div>
        <BulkActionsBar
          selectedCount={table.selectedIds.size}
          onDelete={() => setBulkDeleteOpen(true)}
          onExport={() => exportToCSV(data.filter((e) => table.selectedIds.has(e.id)), "employees_selected", CSV_COLS)}
          onClear={table.clearSelection}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={table.paginated.length > 0 && table.paginated.every((e) => table.selectedIds.has(e.id))} onChange={table.selectAll} className="rounded border-border" />
                </th>
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
                <tr key={emp.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${table.selectedIds.has(emp.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={table.selectedIds.has(emp.id)} onChange={() => table.toggleSelect(emp.id)} className="rounded border-border" />
                  </td>
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
                      <button onClick={() => navigate(`/employees/${emp.id}`)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
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
      <DeleteDialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={handleBulkDelete} title="Delete Selected" description={`Are you sure you want to delete ${table.selectedIds.size} employees?`} />
    </DashboardLayout>
  );
}
