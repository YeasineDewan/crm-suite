import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, SortableHeader } from "@/components/TableToolbar";
import { Pagination } from "@/components/Pagination";
import { ClientForm } from "@/components/forms/ClientForm";
import { DeleteDialog } from "@/components/forms/DeleteDialog";
import { useDataTable } from "@/hooks/useDataTable";
import { useClients } from "@/hooks/useClients";
import { Building2, UserPlus, DollarSign, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import type { Client } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";
import { exportToCSV } from "@/lib/csvExport";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ClientDashboard() {
  const { data, isLoading, upsert, remove } = useClients();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Client | null>(null);
  const [deleteItem, setDeleteItem] = useState<Client | null>(null);

  const table = useDataTable({ data, searchFields: ["name", "company", "email"], defaultSort: "name" });

  const active = data.filter(c => c.status === "active").length;
  const prospects = data.filter(c => c.status === "prospect").length;
  const totalRevenue = data.reduce((a, c) => a + c.totalSpent, 0);

  const statusData = [
    { name: "Active", value: active, color: "hsl(152, 69%, 41%)" },
    { name: "Prospect", value: prospects, color: "hsl(210, 100%, 50%)" },
    { name: "Inactive", value: data.filter(c => c.status === "inactive").length, color: "hsl(220, 10%, 46%)" },
  ];

  const handleSave = (client: Client) => {
    upsert.mutate(client);
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) remove.mutate(deleteItem.id);
    setDeleteItem(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Clients" subtitle="Manage your client relationships and revenue.">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clients" subtitle="Manage your client relationships and revenue.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Clients" value={String(data.length)} icon={Building2} gradient="stat-gradient-blue" />
        <StatCard title="Active Clients" value={String(active)} change="+2 this month" changeType="positive" icon={UserPlus} gradient="stat-gradient-green" />
        <StatCard title="Total Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} gradient="stat-gradient-purple" />
        <StatCard title="Prospects" value={String(prospects)} icon={Clock} gradient="stat-gradient-amber" />
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
            <TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Search clients...">
              <ExportButton
                onExportAll={() => exportToCSV(data, "clients", [
                  { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "company", label: "Company" },
                  { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "status", label: "Status" },
                  { key: "totalSpent", label: "Total Spent" }, { key: "lastContact", label: "Last Contact" },
                ])}
                onExportFiltered={() => exportToCSV(table.filtered, "clients_filtered", [
                  { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "company", label: "Company" },
                  { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "status", label: "Status" },
                  { key: "totalSpent", label: "Total Spent" }, { key: "lastContact", label: "Last Contact" },
                ])}
                filteredCount={table.filtered.length}
              />
              <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Client
              </Button>
            </TableToolbar>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <SortableHeader label="Client" sortKey="name" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Client)} />
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <SortableHeader label="Total Spent" sortKey="totalSpent" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Client)} />
                  <SortableHeader label="Last Contact" sortKey="lastContact" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Client)} />
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {table.paginated.map((client) => (
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
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditItem(client); setFormOpen(true); }} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteItem(client)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPageChange={table.setPage} />
        </div>
      </div>

      <ClientForm open={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} onSave={handleSave} client={editItem} />
      <DeleteDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Client" description={`Are you sure you want to remove ${deleteItem?.name}?`} />
    </DashboardLayout>
  );
}
