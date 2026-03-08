import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/data/mockData";

interface DbOrder {
  id: string;
  order_id: string;
  client_name: string;
  items: number;
  total: number;
  status: string;
  date: string;
  priority: string;
  assigned_to: string | null;
}

const toOrder = (row: DbOrder): Order => ({
  id: row.order_id,
  clientName: row.client_name,
  items: row.items,
  total: Number(row.total),
  status: row.status as Order["status"],
  date: row.date,
  priority: row.priority as Order["priority"],
  assignedTo: row.assigned_to ?? undefined,
});

export function useOrders() {
  const qc = useQueryClient();
  const key = ["orders"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data as unknown as DbOrder[]).map(toOrder);
    },
  });

  const upsert = useMutation({
    mutationFn: async (order: Order) => {
      const existing = await supabase.from("orders").select("id").eq("order_id" as any, order.id).maybeSingle();
      const row = {
        order_id: order.id,
        client_name: order.clientName,
        items: order.items,
        total: order.total,
        status: order.status,
        date: order.date,
        priority: order.priority,
        assigned_to: order.assignedTo ?? null,
      };
      if (existing.data) {
        const { error } = await supabase.from("orders").update(row as any).eq("id" as any, existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("orders").insert(row as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase.from("orders").delete().eq("order_id" as any, orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, remove };
}
