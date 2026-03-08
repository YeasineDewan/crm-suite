import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, SortableHeader } from "@/components/TableToolbar";
import { Pagination } from "@/components/Pagination";
import { FilterBar } from "@/components/FilterBar";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { OrderForm } from "@/components/forms/OrderForm";
import { DeleteDialog } from "@/components/forms/DeleteDialog";
import { useDataTable } from "@/hooks/useDataTable";
import { useOrders } from "@/hooks/useOrders";
import { useActivityLog } from "@/hooks/useActivityLog";
import { ShoppingCart, Clock, Truck, CheckCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { revenueData, type Order } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";
import { exportToCSV } from "@/lib/csvExport";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const CSV_COLS = [
  { key: "id" as const, label: "Order ID" }, { key: "clientName" as const, label: "Client" }, { key: "items" as const, label: "Items" },
  { key: "total" as const, label: "Total" }, { key: "status" as const, label: "Status" }, { key: "priority" as const, label: "Priority" }, { key: "date" as const, label: "Date" },
];

export default function OrderDashboard() {
  const { data, isLoading, upsert, remove } = useOrders();
  const { log } = useActivityLog();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Order | null>(null);
  const [deleteItem, setDeleteItem] = useState<Order | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const table = useDataTable({
    data,
    searchFields: ["id", "clientName", "status"],
    defaultSort: "date",
    defaultSortDir: "desc",
    filterableFields: [
      { key: "status", values: ["pending", "processing", "shipped", "delivered", "cancelled"] },
      { key: "priority", values: ["low", "medium", "high"] },
    ],
  });

  const pending = data.filter(o => o.status === "pending").length;
  const processing = data.filter(o => o.status === "processing").length;
  const shipped = data.filter(o => o.status === "shipped").length;
  const delivered = data.filter(o => o.status === "delivered").length;
  const totalValue = data.reduce((a, o) => a + o.total, 0);

  const handleSave = (order: Order) => {
    const isNew = !editItem;
    upsert.mutate(order);
    log.mutate({ entityType: "order", entityId: order.id, action: isNew ? "created" : "updated", description: `${isNew ? "Created" : "Updated"} order ${order.id}` });
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) {
      remove.mutate(deleteItem.id);
      log.mutate({ entityType: "order", entityId: deleteItem.id, action: "deleted", description: `Deleted order ${deleteItem.id}` });
    }
    setDeleteItem(null);
  };

  const handleBulkDelete = () => {
    table.selectedIds.forEach((id) => {
      remove.mutate(id);
      log.mutate({ entityType: "order", entityId: id, action: "deleted", description: `Bulk deleted order ${id}` });
    });
    table.clearSelection();
    setBulkDeleteOpen(false);
    toast.success(`Deleted ${table.selectedIds.size} orders`);
  };

  const handleBulkStatusChange = (status: string) => {
    data.filter((o) => table.selectedIds.has(o.id)).forEach((order) => {
      upsert.mutate({ ...order, status: status as Order["status"] });
      log.mutate({ entityType: "order", entityId: order.id, action: "updated", description: `Bulk status change to ${status} for order ${order.id}` });
    });
    table.clearSelection();
    toast.success(`Updated ${table.selectedIds.size} orders to ${status}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Orders" subtitle="Track and manage all customer orders.">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Orders" subtitle="Track and manage all customer orders.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Orders" value={String(data.length)} icon={ShoppingCart} gradient="stat-gradient-blue" />
        <StatCard title="Pending" value={String(pending)} change={`${data.filter(o => o.status === "pending" && o.priority === "high").length} high priority`} changeType="negative" icon={Clock} gradient="stat-gradient-amber" />
        <StatCard title="In Transit" value={String(processing + shipped)} icon={Truck} gradient="stat-gradient-purple" />
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
        <div className="p-5 border-b border-border space-y-3">
          <TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Search orders...">
            <ExportButton onExportAll={() => exportToCSV(data, "orders", CSV_COLS)} onExportFiltered={() => exportToCSV(table.filtered, "orders_filtered", CSV_COLS)} filteredCount={table.filtered.length} />
            <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> New Order
            </Button>
          </TableToolbar>
          <FilterBar filters={table.filterOptions} activeFilters={table.activeFilters} onFilterChange={table.setFilter} onClearAll={table.clearFilters} />
        </div>
        <BulkActionsBar
          selectedCount={table.selectedIds.size}
          onDelete={() => setBulkDeleteOpen(true)}
          onExport={() => exportToCSV(data.filter((o) => table.selectedIds.has(o.id)), "orders_selected", CSV_COLS)}
          onStatusChange={handleBulkStatusChange}
          statusOptions={["pending", "processing", "shipped", "delivered", "cancelled"]}
          onClear={table.clearSelection}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={table.paginated.length > 0 && table.paginated.every((o) => table.selectedIds.has(o.id))} onChange={table.selectAll} className="rounded border-border" />
                </th>
                <SortableHeader label="Order ID" sortKey="id" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Order)} />
                <SortableHeader label="Client" sortKey="clientName" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Order)} />
                <SortableHeader label="Items" sortKey="items" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Order)} />
                <SortableHeader label="Total" sortKey="total" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Order)} />
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Priority</th>
                <SortableHeader label="Date" sortKey="date" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof Order)} />
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {table.paginated.map((order) => (
                <tr key={order.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${table.selectedIds.has(order.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={table.selectedIds.has(order.id)} onChange={() => table.toggleSelect(order.id)} className="rounded border-border" />
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">{order.id}</td>
                  <td className="px-5 py-3 text-foreground">{order.clientName}</td>
                  <td className="px-5 py-3 text-foreground">{order.items}</td>
                  <td className="px-5 py-3 text-foreground font-medium">${order.total.toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3"><StatusBadge status={order.priority} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{order.date}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditItem(order); setFormOpen(true); }} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => setDeleteItem(order)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPageChange={table.setPage} />
      </div>

      <OrderForm open={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} onSave={handleSave} order={editItem} />
      <DeleteDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Order" description={`Are you sure you want to delete ${deleteItem?.id}?`} />
      <DeleteDialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={handleBulkDelete} title="Delete Selected" description={`Are you sure you want to delete ${table.selectedIds.size} orders?`} />
    </DashboardLayout>
  );
}
