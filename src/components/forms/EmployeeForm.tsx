import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageDropZone } from "@/components/ImageDropZone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Briefcase, Building, Calendar, BarChart3 } from "lucide-react";
import type { Employee } from "@/data/mockData";

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee | null;
}

const emptyEmployee: Omit<Employee, "id" | "avatar"> & { image?: string; notes?: string } = {
  name: "", email: "", role: "", department: "", status: "active",
  joinDate: new Date().toISOString().split("T")[0], performance: 80,
};

export function EmployeeForm({ open, onClose, onSave, employee }: EmployeeFormProps) {
  const [form, setForm] = useState<typeof emptyEmployee>(emptyEmployee);
  const [tab, setTab] = useState("details");
  const isEdit = !!employee;

  useEffect(() => {
    if (employee) {
      setForm({ name: employee.name, email: employee.email, role: employee.role, department: employee.department, status: employee.status, joinDate: employee.joinDate, performance: employee.performance });
    } else {
      setForm(emptyEmployee);
    }
    setTab("details");
  }, [employee, open]);

  const handleSave = () => {
    const id = employee?.id || `E${String(Date.now()).slice(-3)}`;
    const avatar = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    onSave({ ...form, id, avatar });
    onClose();
  };

  const isValid = form.name && form.email && form.role;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEdit ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <p className="text-sm text-muted-foreground">{isEdit ? "Update employee information" : "Fill in the details to add a new team member"}</p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="photo">Photo</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sarah Johnson" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="sarah@company.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Job Title *</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Sales Manager" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Department</Label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                  <option value="">Select department</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Support">Support</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Employee["status"] })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Join Date</Label>
                <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Performance</Label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={form.performance} onChange={(e) => setForm({ ...form, performance: Number(e.target.value) })} className="flex-1 accent-primary" />
                  <span className="text-sm font-medium text-foreground w-10 text-right">{form.performance}%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photo" className="mt-4">
            <ImageDropZone
              value={form.image}
              onChange={(img) => setForm({ ...form, image: img })}
              label="Upload Employee Photo"
            />
            <p className="text-xs text-muted-foreground mt-3 text-center">
              This photo will be displayed on the employee's profile card
            </p>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional information about this employee..."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>{isEdit ? "Save Changes" : "Add Employee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
