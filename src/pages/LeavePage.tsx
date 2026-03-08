import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useLeaveRequests, LEAVE_TYPES } from "@/hooks/useLeaveRequests";
import { useEmployees } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, CheckCircle, XCircle, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

export default function LeavePage() {
  const { data: leaves, isLoading, create, approve, reject, remove } = useLeaveRequests();
  const { data: employees } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", leaveType: "casual", startDate: "", endDate: "", reason: "" });

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const totalDaysOff = leaves.filter((l) => l.status === "approved").reduce((a, l) => a + l.days, 0);

  const handleSubmit = async () => {
    if (!form.employeeId || !form.startDate || !form.endDate) { toast.error("Fill all required fields"); return; }
    const emp = employees.find((e) => e.id === form.employeeId);
    const days = differenceInDays(new Date(form.endDate), new Date(form.startDate)) + 1;
    if (days < 1) { toast.error("End date must be after start date"); return; }
    await create.mutateAsync({
      employeeId: emp?.id ?? form.employeeId, employeeName: emp?.name ?? "Unknown",
      leaveType: form.leaveType, startDate: form.startDate, endDate: form.endDate,
      days, reason: form.reason, status: "pending",
    });
    toast.success("Leave request submitted");
    setDialogOpen(false);
    setForm({ employeeId: "", leaveType: "casual", startDate: "", endDate: "", reason: "" });
  };

  return (
    <DashboardLayout title="Leave Management" subtitle="Apply for leave, track balances and approvals">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
          <CalendarDays className="w-5 h-5 text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{leaves.length}</p>
          <p className="text-xs text-muted-foreground">Total Requests</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <p className="text-2xl font-bold text-foreground">{totalDaysOff}</p>
          <p className="text-xs text-muted-foreground">Total Days Off</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Apply for Leave</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">From</th>
                <th className="text-left p-3 font-medium text-muted-foreground">To</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Days</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No leave requests</td></tr>
              ) : leaves.map((l) => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium text-foreground">{l.employeeName}</td>
                  <td className="p-3"><span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{l.leaveType}</span></td>
                  <td className="p-3 text-muted-foreground">{l.startDate}</td>
                  <td className="p-3 text-muted-foreground">{l.endDate}</td>
                  <td className="p-3 font-medium text-foreground">{l.days}</td>
                  <td className="p-3 text-muted-foreground max-w-[200px] truncate">{l.reason || "—"}</td>
                  <td className="p-3"><StatusBadge status={l.status} /></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {l.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 text-success" onClick={() => { approve.mutate({ id: l.id, approvedBy: "Admin" }); toast.success("Approved"); }}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => { reject.mutate(l.id); toast.success("Rejected"); }}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => { remove.mutate(l.id); toast.success("Deleted"); }}><Trash2 className="w-3 h-3" /></Button>
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
          <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.leaveType} onValueChange={(v) => setForm({ ...form, leaveType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEAVE_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">From</label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">To</label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <Textarea placeholder="Reason for leave" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} />
            <div className="flex justify-end"><Button onClick={handleSubmit}>Submit Request</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
