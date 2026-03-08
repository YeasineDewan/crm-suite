import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useExpenses, EXPENSE_CATEGORIES } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, DollarSign, CheckCircle, XCircle, Trash2, Edit, Receipt } from "lucide-react";
import { toast } from "sonner";

export default function ExpensesPage() {
  const { data: expenses, isLoading, upsert, approve, reject, remove } = useExpenses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", category: "general", amount: "", date: "", submittedBy: "", notes: "" });

  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const approvedTotal = expenses.filter((e) => e.status === "approved").reduce((a, e) => a + e.amount, 0);

  const openNew = () => {
    setEditItem(null);
    setForm({ title: "", category: "general", amount: "", date: new Date().toISOString().split("T")[0], submittedBy: "", notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (expense: any) => {
    setEditItem(expense);
    setForm({ title: expense.title, category: expense.category, amount: String(expense.amount), date: expense.date, submittedBy: expense.submittedBy, notes: expense.notes });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount) { toast.error("Title and amount required"); return; }
    await upsert.mutateAsync({
      expenseId: editItem?.expenseId ?? `EXP-${Date.now().toString().slice(-6)}`,
      title: form.title, category: form.category, amount: Number(form.amount),
      date: form.date, submittedBy: form.submittedBy || "System", notes: form.notes,
    });
    toast.success(editItem ? "Updated" : "Expense submitted");
    setDialogOpen(false);
  };

  return (
    <DashboardLayout title="Expense Tracking" subtitle="Submit, track and approve business expenses">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary" /><p className="text-xs text-muted-foreground">Total Expenses</p></div>
          <p className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="text-xs text-muted-foreground mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-foreground">{pendingExpenses.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-xs text-muted-foreground mb-1">Approved Total</p>
          <p className="text-2xl font-bold text-foreground">${approvedTotal.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p className="text-2xl font-bold text-foreground">
            ${expenses.filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((a, e) => a + e.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Submit Expense</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Submitted By</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No expenses yet</td></tr>
              ) : expenses.map((e) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs text-muted-foreground">{e.expenseId}</td>
                  <td className="p-3 font-medium text-foreground">{e.title}</td>
                  <td className="p-3"><span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{e.category}</span></td>
                  <td className="p-3 font-semibold text-foreground">${e.amount.toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">{e.date}</td>
                  <td className="p-3 text-muted-foreground">{e.submittedBy}</td>
                  <td className="p-3"><StatusBadge status={e.status} /></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {e.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-success" onClick={() => { approve.mutate({ id: e.id, approvedBy: "Admin" }); toast.success("Approved"); }}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => { reject.mutate(e.id); toast.success("Rejected"); }}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => openEdit(e)}><Edit className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => { remove.mutate(e.id); toast.success("Deleted"); }}><Trash2 className="w-3 h-3" /></Button>
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
          <DialogHeader><DialogTitle>{editItem ? "Edit Expense" : "Submit Expense"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Expense title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Amount ($)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input placeholder="Submitted by" value={form.submittedBy} onChange={(e) => setForm({ ...form, submittedBy: e.target.value })} />
            </div>
            <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            <div className="flex justify-end">
              <Button onClick={handleSave}>{editItem ? "Update" : "Submit"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
