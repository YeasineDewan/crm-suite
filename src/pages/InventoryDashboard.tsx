import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TableToolbar, SortableHeader } from "@/components/TableToolbar";
import { Pagination } from "@/components/Pagination";
import { InventoryForm } from "@/components/forms/InventoryForm";
import { DeleteDialog } from "@/components/forms/DeleteDialog";
import { useDataTable } from "@/hooks/useDataTable";
import { Package, AlertTriangle, CheckCircle, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { inventory as initialInventory, type InventoryItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";
import { exportToCSV } from "@/lib/csvExport";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function InventoryDashboard() {
  const [data, setData] = useState<InventoryItem[]>(initialInventory);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);

  const table = useDataTable({ data, searchFields: ["name", "sku", "category"], defaultSort: "name" });

  const inStock = data.filter(i => i.status === "in-stock").length;
  const lowStock = data.filter(i => i.status === "low-stock").length;
  const totalValue = data.reduce((a, i) => a + i.quantity * i.price, 0);

  const categoryData = Object.entries(
    data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value], i) => ({
    name, value,
    color: ["hsl(210, 100%, 50%)", "hsl(168, 80%, 42%)", "hsl(262, 83%, 58%)"][i % 3],
  }));

  const handleSave = (item: InventoryItem) => {
    setData(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? item : i);
      return [...prev, item];
    });
    setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) setData(prev => prev.filter(i => i.id !== deleteItem.id));
    setDeleteItem(null);
  };

  return (
    <DashboardLayout title="Inventory" subtitle="Track stock levels and manage your products.">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Items" value={String(data.length)} icon={Package} gradient="stat-gradient-blue" />
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
            <TableToolbar search={table.search} onSearchChange={table.setSearch} placeholder="Search inventory...">
              <ExportButton
                onExportAll={() => exportToCSV(data, "inventory", [
                  { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "sku", label: "SKU" },
                  { key: "category", label: "Category" }, { key: "quantity", label: "Quantity" }, { key: "price", label: "Price" },
                  { key: "status", label: "Status" }, { key: "lastRestocked", label: "Last Restocked" },
                ])}
                onExportFiltered={() => exportToCSV(table.filtered, "inventory_filtered", [
                  { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "sku", label: "SKU" },
                  { key: "category", label: "Category" }, { key: "quantity", label: "Quantity" }, { key: "price", label: "Price" },
                  { key: "status", label: "Status" }, { key: "lastRestocked", label: "Last Restocked" },
                ])}
                filteredCount={table.filtered.length}
              />
              <Button size="sm" onClick={() => { setEditItem(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </TableToolbar>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <SortableHeader label="Product" sortKey="name" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof InventoryItem)} />
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">SKU</th>
                  <SortableHeader label="Category" sortKey="category" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof InventoryItem)} />
                  <SortableHeader label="Qty" sortKey="quantity" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof InventoryItem)} />
                  <SortableHeader label="Price" sortKey="price" currentSort={table.sortKey as string} sortDir={table.sortDir} onSort={(k) => table.toggleSort(k as keyof InventoryItem)} />
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {table.paginated.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{item.sku}</td>
                    <td className="px-5 py-3 text-foreground">{item.category}</td>
                    <td className="px-5 py-3 text-foreground">{item.quantity}</td>
                    <td className="px-5 py-3 text-foreground font-medium">${item.price.toLocaleString()}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditItem(item); setFormOpen(true); }} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteItem(item)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
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

      <InventoryForm open={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} onSave={handleSave} item={editItem} />
      <DeleteDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Item" description={`Are you sure you want to remove ${deleteItem?.name}?`} />
    </DashboardLayout>
  );
}
