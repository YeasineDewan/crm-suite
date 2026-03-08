import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, User, Calendar, DollarSign, Package, FileText } from "lucide-react";
import type { Order } from "@/data/mockData";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  order?: Order | null;
}

const emptyOrder: Omit<Order, "id"> & { image?: string; notes?: string; shippingAddress?: string } = {
  clientName: "", items: 1, total: 0, status: "pending",
  date: new Date().toISOString().split("T")[0], priority: "medium",
};

export function OrderForm({ open, onClose, onSave, order }: OrderFormProps) {
  const [form, setForm] = useState<typeof emptyOrder>(emptyOrder);
  const [tab, setTab] = useState("details");
  const isEdit = !!order;

  useEffect(() => {
    if (order) {
      setForm({ clientName: order.clientName, items: order.items, total: order.total, status: order.status, date: order.date, priority: order.priority });
    } else {
      setForm(emptyOrder);
    }
    setTab("details");
  }, [order, open]);

  const handleSave = () => {
    const id = order?.id || `ORD-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id });
    onClose();
  };

  const isValid = form.clientName && form.total > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEdit ? "Edit Order" : "Create New Order"}</DialogTitle>
          <p className="text-sm text-muted-foreground">{isEdit ? "Update order details" : "Fill in the order information"}</p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Order Info</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Client Name *</Label>
                <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Order Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Number of Items</Label>
                <Input type="number" min={1} value={form.items} onChange={(e) => setForm({ ...form, items: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Total Amount *</Label>
                <Input type="number" min={0} value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" /> Status</Label>
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
                <div className="flex gap-2 pt-1">
                  {(["low", "medium", "high"] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                        form.priority === p
                          ? p === "high" ? "bg-destructive/10 border-destructive text-destructive"
                          : p === "medium" ? "bg-warning/10 border-warning text-warning"
                          : "bg-muted border-primary text-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="mt-4">
            <ImageDropZone
              value={form.image}
              onChange={(img) => setForm({ ...form, image: img })}
              label="Upload Invoice or Receipt"
            />
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Attach order documents, invoices, or receipts
            </p>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Shipping Address</Label>
              <Input value={form.shippingAddress || ""} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} placeholder="Full shipping address" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Notes</Label>
              <Textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Special instructions, notes, etc."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>{isEdit ? "Save Changes" : "Create Order"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
