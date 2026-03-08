import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, SortableHeader } from "@/components/TableToolbar";
import { Pagination } from "@/components/Pagination";
import { FilterBar } from "@/components/FilterBar";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { ClientForm } from "@/components/forms/ClientForm";
import { DeleteDialog } from "@/components/forms/DeleteDialog";
import { useDataTable } from "@/hooks/useDataTable";
import { useClients } from "@/hooks/useClients";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Building2, UserPlus, DollarSign, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import type { Client } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";
import { exportToCSV } from "@/lib/csvExport";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

const CSV_COLS = [
  { key: "id" as const, label: "ID" }, { key: "name" as const, label: "Name" }, { key: "company" as const, label: "Company" },
  { key: "email" as const, label: "Email" }, { key: "phone" as const, label: "Phone" }, { key: "status" as const, label: "Status" },
  { key: "totalSpent" as const, label: "Total Spent" }, { key: "lastContact" as const, label: "Last Contact" },
];

export default function ClientDashboard() {
  const { data, isLoading, upsert, remove } = useClients();
  const { log } = useActivityLog();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Client | null>(null);
  const [deleteItem, setDeleteItem] = useState<Client | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const table = useDataTable({
    data,
    searchFields: ["name", "company", "email"],
    defaultSort: "name",
    filterableFields: [
      { key: "status", values: ["active", "inactive", "prospect"] },
    ],
  });

  const active = data.filter(c => c.status === "active").length;
  const prospects = data.filter(c => c.status === "prospect").length;
  const totalRevenue = data.reduce((a, c) => a + c.totalSpent, 0);

  const statusData = [
    { name: "Active", value: active, color: "hsl(152, 69%, 41%)" },
    { name: "Prospect", value: prospects, color: "hsl(210, 100%, 50%)" },
    { name: "Inactive", value: data.filter(c => c.status === "inactive").length, color: "hsl(220, 10%, 46%)" },
  ];

  const handleSave = (client: Client) => {
    const isNew = !editItem;
    upsert.mutate(client);
    log.mutate({ entityType: "client", entityId: client.id, action: isNew ? "created" : "updated", description: `${isNew ? "Created" : "Updated"} client ${client.name}` });
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) {
      remove.mutate(deleteItem.id);
      log.mutate({ entityType: "client", entityId: deleteItem.id, action: "deleted", description: `Deleted client ${deleteItem.name}` });
    }
    setDeleteItem(null);
  };

  const handleBulkDelete = () => {
    table.selectedIds.forEach((id) => {
      remove.mutate(id);
      log.mutate({ entityType: "client", entityId: id, action: "deleted", description: `Bulk deleted client ${id}` });
    });
    table.clearSelection();
    setBulkDeleteOpen(false);
    toast.success(`Deleted ${table.selectedIds.size} clients`);
  };

  const handleBulkExport = () => {
    const selected = data.filter((c) => table.selectedIds.has(c.id));
    exportToCSV(selected, "clients_selected", CSV_COLS);
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
          <div className="p-5 border-b border-border space-y-3">
            <TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Search clients...">
              <ExportButton onExportAll={() => exportToCSV(data, "clients", CSV_COLS)} onExportFiltered={() => exportToCSV(table.filtered, "clients_filtered", CSV_COLS)} filteredCount={table.filtered.length} />
              <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Client
              </Button>
            </TableToolbar>
            <FilterBar filters={table.filterOptions} activeFilters={table.activeFilters} onFilterChange={table.setFilter} onClearAll={table.clearFilters} />
          </div>
          <BulkActionsBar
            selectedCount={table.selectedIds.size}
            onDelete={() => setBulkDeleteOpen(true)}
            onExport={handleBulkExport}
            onClear={table.clearSelection}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-3 w-10">
                    <input type="checkbox" checked={table.paginated.length > 0 && table.paginated.every((c) => table.selectedIds.has(c.id))} onChange={table.selectAll} className="rounded border-border" />
                  </th>
                  <SortableHeader label="Client" sortKey="name" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Client)} />
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <SortableHeader label="Total Spent" sortKey="totalSpent" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Client)} />
                  <SortableHeader label="Last Contact" sortKey="lastContact" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Client)} />
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {table.paginated.map((client) => (
                  <tr key={client.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${table.selectedIds.has(client.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={table.selectedIds.has(client.id)} onChange={() => table.toggleSelect(client.id)} className="rounded border-border" />
                    </td>
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
      <DeleteDialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={handleBulkDelete} title="Delete Selected" description={`Are you sure you want to delete ${table.selectedIds.size} clients?`} />
    </DashboardLayout>
  );
}
