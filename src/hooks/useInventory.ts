import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { InventoryItem } from "@/data/mockData";

interface DbItem {
  id: string;
  item_id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  status: string;
  last_restocked: string;
}

const toItem = (row: DbItem): InventoryItem => ({
  id: row.item_id,
  name: row.name,
  sku: row.sku,
  category: row.category,
  quantity: row.quantity,
  price: Number(row.price),
  status: row.status as InventoryItem["status"],
  lastRestocked: row.last_restocked,
});

export function useInventory() {
  const qc = useQueryClient();
  const key = ["inventory"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory_items").select("*").order("name");
      if (error) throw error;
      return (data as unknown as DbItem[]).map(toItem);
    },
  });

  const upsert = useMutation({
    mutationFn: async (item: InventoryItem) => {
      const existing = await supabase.from("inventory_items").select("id").eq("item_id" as any, item.id).maybeSingle();
      const row = {
        item_id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        status: item.status,
        last_restocked: item.lastRestocked,
      };
      if (existing.data) {
        const { error } = await supabase.from("inventory_items").update(row as any).eq("id" as any, existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("inventory_items").insert(row as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("item_id" as any, itemId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, remove };
}
