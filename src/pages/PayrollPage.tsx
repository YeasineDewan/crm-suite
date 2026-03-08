import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { usePayroll } from "@/hooks/usePayroll";
import { useEmployees } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, DollarSign, Trash2, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PayrollPage() {
  const { data: payroll, isLoading, upsert, markPaid, remove } = usePayroll();
  const { data: employees } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ employeeId: "", month: format(new Date(), "yyyy-MM"), basicSalary: "", allowances: "", deductions: "" });

  const totalPayroll = payroll.reduce((a, p) => a + p.netSalary, 0);
  const paidTotal = payroll.filter((p) => p.status === "paid").reduce((a, p) => a + p.netSalary, 0);
  const draftCount = payroll.filter((p) => p.status === "draft").length;

  const openNew = () => {
    setEditItem(null);
    setForm({ employeeId: "", month: format(new Date(), "yyyy-MM"), basicSalary: "", allowances: "0", deductions: "0" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.employeeId || !form.basicSalary) { toast.error("Employee and salary required"); return; }
    const emp = employees.find((e) => e.id === form.employeeId);
    const basic = Number(form.basicSalary);
    const allowances = Number(form.allowances) || 0;
    const deductions = Number(form.deductions) || 0;
    await upsert.mutateAsync({
      id: editItem?.id, employeeId: emp?.id ?? form.employeeId,
      employeeName: emp?.name ?? "Unknown", month: form.month,
      basicSalary: basic, allowances, deductions,
      netSalary: basic + allowances - deductions, status: "draft", paidOn: null, notes: "",
    });
    toast.success(editItem ? "Updated" : "Payroll record created");
    setDialogOpen(false);
  };

  const generatePayslip = (record: any) => {
    const content = `
PAYSLIP - ${record.month}
========================
Employee: ${record.employeeName}
Employee ID: ${record.employeeId}

Basic Salary:  $${record.basicSalary.toLocaleString()}
Allowances:    $${record.allowances.toLocaleString()}
Deductions:    -$${record.deductions.toLocaleString()}
------------------------
Net Salary:    $${record.netSalary.toLocaleString()}

Status: ${record.status.toUpperCase()}
${record.paidOn ? `Paid On: ${record.paidOn}` : ""}
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payslip-${record.employeeName.replace(/\s/g, "-")}-${record.month}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Payslip downloaded");
  };

  return (
    <DashboardLayout title="Payroll" subtitle="Manage salaries, deductions and generate payslips">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
          <DollarSign className="w-5 h-5 text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">${totalPayroll.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Payroll</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="text-2xl font-bold text-foreground">${paidTotal.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Paid</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-2xl font-bold text-foreground">{draftCount}</p>
          <p className="text-xs text-muted-foreground">Draft Records</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <p className="text-2xl font-bold text-foreground">{payroll.length}</p>
          <p className="text-xs text-muted-foreground">Total Records</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Payroll</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Month</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Basic</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Allowances</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Deductions</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Net Salary</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : payroll.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No payroll records</td></tr>
              ) : payroll.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium text-foreground">{p.employeeName}</td>
                  <td className="p-3 text-muted-foreground">{p.month}</td>
                  <td className="p-3 text-foreground">${p.basicSalary.toLocaleString()}</td>
                  <td className="p-3 text-success">${p.allowances.toLocaleString()}</td>
                  <td className="p-3 text-destructive">-${p.deductions.toLocaleString()}</td>
                  <td className="p-3 font-bold text-foreground">${p.netSalary.toLocaleString()}</td>
                  <td className="p-3"><StatusBadge status={p.status === "paid" ? "completed" : p.status === "draft" ? "pending" : p.status} /></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {p.status === "draft" && (
                        <Button size="sm" variant="ghost" className="h-7 text-success" onClick={() => { markPaid.mutate(p.id); toast.success("Marked as paid"); }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => generatePayslip(p)}>
                        <FileText className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => { remove.mutate(p.id); toast.success("Deleted"); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Payroll Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground">Basic Salary</label><Input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Allowances</label><Input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Deductions</label><Input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} /></div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Net Salary: </span>
              <span className="font-bold text-foreground">
                ${((Number(form.basicSalary) || 0) + (Number(form.allowances) || 0) - (Number(form.deductions) || 0)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-end"><Button onClick={handleSave}>Create</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
