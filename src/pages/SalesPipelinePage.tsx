import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useDeals, DEAL_STAGES } from "@/hooks/useDeals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, DollarSign, TrendingUp, Target, Trash2, Edit, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function SalesPipelinePage() {
  const { data: deals, isLoading, upsert, updateStage, remove } = useDeals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any>(null);
  const [form, setForm] = useState({
    title: "", clientName: "", value: "", stage: "lead", probability: "10", expectedCloseDate: "", assignedTo: "", notes: "",
  });

  const pipelineValue = deals.filter((d) => !d.stage.startsWith("closed")).reduce((a, d) => a + d.value, 0);
  const wonValue = deals.filter((d) => d.stage === "closed-won").reduce((a, d) => a + d.value, 0);
  const avgDealSize = deals.length > 0 ? deals.reduce((a, d) => a + d.value, 0) / deals.length : 0;
  const winRate = deals.filter((d) => d.stage.startsWith("closed")).length > 0
    ? Math.round((deals.filter((d) => d.stage === "closed-won").length / deals.filter((d) => d.stage.startsWith("closed")).length) * 100) : 0;

  const openNew = () => {
    setEditDeal(null);
    setForm({ title: "", clientName: "", value: "", stage: "lead", probability: "10", expectedCloseDate: "", assignedTo: "", notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (deal: any) => {
    setEditDeal(deal);
    setForm({
      title: deal.title, clientName: deal.clientName, value: String(deal.value),
      stage: deal.stage, probability: String(deal.probability),
      expectedCloseDate: deal.expectedCloseDate ?? "", assignedTo: deal.assignedTo ?? "", notes: deal.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    const dealId = editDeal?.dealId ?? `DEAL-${String(Date.now()).slice(-6)}`;
    await upsert.mutateAsync({
      dealId, title: form.title, clientName: form.clientName,
      value: Number(form.value) || 0, stage: form.stage,
      probability: Number(form.probability) || 10,
      expectedCloseDate: form.expectedCloseDate || null,
      assignedTo: form.assignedTo || null, notes: form.notes,
    });
    toast.success(editDeal ? "Deal updated" : "Deal created");
    setDialogOpen(false);
  };

  const moveToNextStage = (deal: any) => {
    const idx = DEAL_STAGES.findIndex((s) => s.id === deal.stage);
    if (idx < DEAL_STAGES.length - 2) {
      updateStage.mutate({ id: deal.id, stage: DEAL_STAGES[idx + 1].id });
      toast.success(`Moved to ${DEAL_STAGES[idx + 1].label}`);
    }
  };

  return (
    <DashboardLayout title="Sales Pipeline" subtitle="Track deals from lead to close">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Pipeline Value</p>
          </div>
          <p className="text-2xl font-bold text-foreground">${pipelineValue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-xs text-muted-foreground">Won Revenue</p>
          </div>
          <p className="text-2xl font-bold text-foreground">${wonValue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{winRate}%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Deal Size</p>
          <p className="text-2xl font-bold text-foreground">${Math.round(avgDealSize).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> New Deal</Button>
      </div>

      {/* Kanban-style columns */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 overflow-x-auto">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((a, d) => a + d.value, 0);
          return (
            <div key={stage.id} className="bg-card rounded-xl border border-border min-w-[200px]">
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-medium text-foreground">{stage.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{stageDeals.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">${stageTotal.toLocaleString()}</p>
              </div>
              <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="bg-background rounded-lg border border-border p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium text-foreground leading-tight">{deal.title}</h4>
                      <div className="flex gap-0.5">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEdit(deal)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {deal.clientName && <p className="text-xs text-muted-foreground mt-1">{deal.clientName}</p>}
                    <p className="text-sm font-semibold text-foreground mt-2">${deal.value.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">{deal.probability}% prob.</span>
                      {!stage.id.startsWith("closed") && (
                        <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1" onClick={() => moveToNextStage(deal)}>
                          Next <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No deals</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editDeal ? "Edit Deal" : "New Deal"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Deal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Client name" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Value ($)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Probability %" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
              <Input type="date" placeholder="Expected close" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
            </div>
            <Input placeholder="Assigned to" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
            <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            <div className="flex justify-between">
              {editDeal && (
                <Button variant="destructive" size="sm" onClick={() => { remove.mutate(editDeal.id); setDialogOpen(false); toast.success("Deleted"); }}>
                  Delete
                </Button>
              )}
              <Button onClick={handleSave} className="ml-auto">{editDeal ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
