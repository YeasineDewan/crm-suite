import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Tag, DollarSign, Layers, Calendar, Hash } from "lucide-react";
import type { InventoryItem } from "@/data/mockData";

interface InventoryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  item?: InventoryItem | null;
}

const emptyItem: Omit<InventoryItem, "id"> & { image?: string; description?: string; supplier?: string } = {
  name: "", sku: "", category: "Software", quantity: 0, price: 0, status: "in-stock",
  lastRestocked: new Date().toISOString().split("T")[0],
};

export function InventoryForm({ open, onClose, onSave, item }: InventoryFormProps) {
  const [form, setForm] = useState<typeof emptyItem>(emptyItem);
  const [tab, setTab] = useState("details");
  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setForm({ name: item.name, sku: item.sku, category: item.category, quantity: item.quantity, price: item.price, status: item.status, lastRestocked: item.lastRestocked });
    } else {
      setForm(emptyItem);
    }
    setTab("details");
  }, [item, open]);

  const handleSave = () => {
    const id = item?.id || `INV-${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id });
    onClose();
  };

  const isValid = form.name && form.sku;
  const stockValue = form.quantity * form.price;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEdit ? "Edit Inventory Item" : "Add New Item"}</DialogTitle>
          <p className="text-sm text-muted-foreground">{isEdit ? "Update product information" : "Add a new product to your inventory"}</p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Product Info</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Product Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Enterprise License" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> SKU Code *</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. LIC-ENT-001" className="font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Category</Label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Quantity</Label>
                <Input type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Unit Price</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>

            {/* Stock value indicator */}
            {(form.quantity > 0 && form.price > 0) && (
              <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Stock Value</span>
                <span className="text-lg font-semibold text-foreground">${stockValue.toLocaleString()}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as InventoryItem["status"] })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Last Restocked</Label>
                <Input type="date" value={form.lastRestocked} onChange={(e) => setForm({ ...form, lastRestocked: e.target.value })} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <ImageDropZone
              value={form.image}
              onChange={(img) => setForm({ ...form, image: img })}
              label="Upload Product Image"
            />
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Add a product image for better identification in your inventory
            </p>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={form.supplier || ""} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description, specifications, etc."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>{isEdit ? "Save Changes" : "Add Item"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
