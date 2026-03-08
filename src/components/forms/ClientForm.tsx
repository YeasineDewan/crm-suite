import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Client } from "@/data/mockData";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  client?: Client | null;
}

const emptyClient: Omit<Client, "id"> = {
  name: "", company: "", email: "", phone: "", status: "prospect", totalSpent: 0, lastContact: new Date().toISOString().split("T")[0],
};

export function ClientForm({ open, onClose, onSave, client }: ClientFormProps) {
  const [form, setForm] = useState(emptyClient);
  const isEdit = !!client;

  useEffect(() => {
    if (client) {
      setForm({ name: client.name, company: client.company, email: client.email, phone: client.phone, status: client.status, totalSpent: client.totalSpent, lastContact: client.lastContact });
    } else {
      setForm(emptyClient);
    }
  }, [client, open]);

  const handleSave = () => {
    const id = client?.id || `C${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "Add Client"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Client name" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Client["status"] })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Total Spent</Label>
              <Input type="number" value={form.totalSpent} onChange={(e) => setForm({ ...form, totalSpent: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Last Contact</Label>
              <Input type="date" value={form.lastContact} onChange={(e) => setForm({ ...form, lastContact: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name || !form.email}>{isEdit ? "Save Changes" : "Add Client"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
