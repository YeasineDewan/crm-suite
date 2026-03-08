import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Phone, User, DollarSign, Calendar } from "lucide-react";
import type { Client } from "@/data/mockData";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  client?: Client | null;
}

const emptyClient: Omit<Client, "id"> & { image?: string; notes?: string; address?: string } = {
  name: "", company: "", email: "", phone: "", status: "prospect", totalSpent: 0,
  lastContact: new Date().toISOString().split("T")[0],
};

export function ClientForm({ open, onClose, onSave, client }: ClientFormProps) {
  const [form, setForm] = useState<typeof emptyClient>(emptyClient);
  const [tab, setTab] = useState("details");
  const isEdit = !!client;

  useEffect(() => {
    if (client) {
      setForm({ name: client.name, company: client.company, email: client.email, phone: client.phone, status: client.status, totalSpent: client.totalSpent, lastContact: client.lastContact });
    } else {
      setForm(emptyClient);
    }
    setTab("details");
  }, [client, open]);

  const handleSave = () => {
    const id = client?.id || `C${String(Date.now()).slice(-3)}`;
    onSave({ ...form, id });
    onClose();
  };

  const isValid = form.name && form.email;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEdit ? "Edit Client" : "Add New Client"}</DialogTitle>
          <p className="text-sm text-muted-foreground">{isEdit ? "Update client information" : "Add a new client to your CRM"}</p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Contact Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Smith" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Company</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Acme Corp" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@acme.com" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0101" />
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
                <Label className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Total Spent</Label>
                <Input type="number" min={0} value={form.totalSpent} onChange={(e) => setForm({ ...form, totalSpent: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Last Contact</Label>
                <Input type="date" value={form.lastContact} onChange={(e) => setForm({ ...form, lastContact: e.target.value })} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logo" className="mt-4">
            <ImageDropZone
              value={form.image}
              onChange={(img) => setForm({ ...form, image: img })}
              label="Upload Company Logo"
            />
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Upload the client's company logo for easy identification
            </p>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full business address" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes about this client..."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>{isEdit ? "Save Changes" : "Add Client"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
