import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Order } from "@/data/mockData";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  order?: Order | null;
}

const emptyOrder: Omit<Order, "id"> = {
  clientName: "", items: 1, total: 0, status: "pending", date: new Date().toISOString().split("T")[0], priority: "medium",
};

export function OrderForm({ open, onClose, onSave, order }: OrderFormProps) {
  const [form, setForm] = useState(emptyOrder);
  const isEdit = !!order;

  useEffect(() => {
    if (order) {
      setForm({ clientName: order.clientName, items: order.items, total: order.total, status: order.status, date: order.date, priority: order.priority });
    } else {
      setForm(emptyOrder);
    }
  }, [order, open]);

  const handleSave = () => {
    const id = order?.id || `ORD-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Order" : "New Order"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Items</Label>
              <Input type="number" min={1} value={form.items} onChange={(e) => setForm({ ...form, items: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Total ($)</Label>
              <Input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Order["status"] })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Order["priority"] })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.clientName}>{isEdit ? "Save Changes" : "Create Order"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
