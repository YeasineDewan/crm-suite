import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Employee } from "@/data/mockData";

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee | null;
}

const emptyEmployee: Omit<Employee, "id" | "avatar"> = {
  name: "", email: "", role: "", department: "", status: "active", joinDate: new Date().toISOString().split("T")[0], performance: 80,
};

export function EmployeeForm({ open, onClose, onSave, employee }: EmployeeFormProps) {
  const [form, setForm] = useState(emptyEmployee);
  const isEdit = !!employee;

  useEffect(() => {
    if (employee) {
      setForm({ name: employee.name, email: employee.email, role: employee.role, department: employee.department, status: employee.status, joinDate: employee.joinDate, performance: employee.performance });
    } else {
      setForm(emptyEmployee);
    }
  }, [employee, open]);

  const handleSave = () => {
    const id = employee?.id || `E${String(Date.now()).slice(-3)}`;
    const avatar = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    onSave({ ...form, id, avatar });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Job title" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Department" />
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
              <Label>Join Date</Label>
              <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Performance %</Label>
              <Input type="number" min={0} max={100} value={form.performance} onChange={(e) => setForm({ ...form, performance: Number(e.target.value) })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name || !form.email}>{isEdit ? "Save Changes" : "Add Employee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
