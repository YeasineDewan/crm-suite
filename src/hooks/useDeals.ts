import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Deal {
  id: string;
  dealId: string;
  title: string;
  clientName: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string | null;
  assignedTo: string | null;
  notes: string;
  createdAt: string;
}

export const DEAL_STAGES = [
  { id: "lead", label: "Lead", color: "hsl(210, 100%, 50%)" },
  { id: "qualified", label: "Qualified", color: "hsl(38, 92%, 50%)" },
  { id: "proposal", label: "Proposal", color: "hsl(262, 83%, 58%)" },
  { id: "negotiation", label: "Negotiation", color: "hsl(168, 80%, 42%)" },
  { id: "closed-won", label: "Closed Won", color: "hsl(142, 71%, 45%)" },
  { id: "closed-lost", label: "Closed Lost", color: "hsl(0, 72%, 51%)" },
];

interface DbDeal {
  id: string;
  deal_id: string;
  title: string;
  client_name: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  assigned_to: string | null;
  notes: string;
  created_at: string;
}

const toDeal = (row: DbDeal): Deal => ({
  id: row.id,
  dealId: row.deal_id,
  title: row.title,
  clientName: row.client_name,
  value: Number(row.value),
  stage: row.stage,
  probability: row.probability,
  expectedCloseDate: row.expected_close_date,
  assignedTo: row.assigned_to,
  notes: row.notes ?? "",
  createdAt: row.created_at,
});

export function useDeals() {
  const qc = useQueryClient();
  const key = ["deals"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as DbDeal[]).map(toDeal);
    },
  });

  const upsert = useMutation({
    mutationFn: async (deal: Partial<Deal> & { dealId: string; title: string }) => {
      const row = {
        deal_id: deal.dealId,
        title: deal.title,
        client_name: deal.clientName ?? "",
        value: deal.value ?? 0,
        stage: deal.stage ?? "lead",
        probability: deal.probability ?? 10,
        expected_close_date: deal.expectedCloseDate ?? null,
        assigned_to: deal.assignedTo ?? null,
        notes: deal.notes ?? "",
      };
      const existing = await (supabase as any)
        .from("deals")
        .select("id")
        .eq("deal_id", deal.dealId)
        .maybeSingle();
      if (existing.data) {
        const { error } = await (supabase as any)
          .from("deals")
          .update(row)
          .eq("id", existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("deals").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const prob = stage === "closed-won" ? 100 : stage === "closed-lost" ? 0 :
        stage === "negotiation" ? 70 : stage === "proposal" ? 50 :
        stage === "qualified" ? 30 : 10;
      const { error } = await (supabase as any)
        .from("deals")
        .update({ stage, probability: prob })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, updateStage, remove };
}
