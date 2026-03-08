import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Expense {
  id: string;
  expenseId: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  submittedBy: string;
  approvedBy: string | null;
  status: string;
  receiptUrl: string | null;
  notes: string;
}

export const EXPENSE_CATEGORIES = ["general", "travel", "meals", "office", "software", "equipment", "marketing", "utilities"];

export function useExpenses() {
  const qc = useQueryClient();
  const key = ["expenses"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("expenses").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((r): Expense => ({
        id: r.id, expenseId: r.expense_id, title: r.title, category: r.category,
        amount: Number(r.amount), date: r.date, submittedBy: r.submitted_by,
        approvedBy: r.approved_by, status: r.status, receiptUrl: r.receipt_url, notes: r.notes ?? "",
      }));
    },
  });

  const upsert = useMutation({
    mutationFn: async (e: Partial<Expense> & { expenseId: string; title: string }) => {
      const row = {
        expense_id: e.expenseId, title: e.title, category: e.category ?? "general",
        amount: e.amount ?? 0, date: e.date ?? new Date().toISOString().split("T")[0],
        submitted_by: e.submittedBy ?? "System", approved_by: e.approvedBy ?? null,
        status: e.status ?? "pending", receipt_url: e.receiptUrl ?? null, notes: e.notes ?? "",
      };
      const existing = await (supabase as any).from("expenses").select("id").eq("expense_id", e.expenseId).maybeSingle();
      if (existing.data) {
        const { error } = await (supabase as any).from("expenses").update(row).eq("id", existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("expenses").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const approve = useMutation({
    mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
      const { error } = await (supabase as any).from("expenses").update({ status: "approved", approved_by: approvedBy }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const reject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("expenses").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, approve, reject, remove };
}
