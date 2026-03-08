import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client } from "@/data/mockData";

interface DbClient {
  id: string;
  client_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  total_spent: number;
  last_contact: string;
  assigned_to: string | null;
}

const toClient = (row: DbClient): Client => ({
  id: row.client_id,
  name: row.name,
  company: row.company,
  email: row.email,
  phone: row.phone,
  status: row.status as Client["status"],
  totalSpent: Number(row.total_spent),
  lastContact: row.last_contact,
  assignedTo: row.assigned_to ?? undefined,
});

async function fetchClients(): Promise<Client[]> {
  const { data, error } = await (supabase as any).from("clients").select("*").order("name");
  if (error) throw error;
  return (data as DbClient[]).map(toClient);
}

export function useClients() {
  const qc = useQueryClient();
  const key = ["clients"];

  const query = useQuery({ queryKey: key, queryFn: fetchClients });

  const upsert = useMutation({
    mutationFn: async (client: Client) => {
      const s = supabase as any;
      const existing = await s.from("clients").select("id").eq("client_id", client.id).maybeSingle();
      const row = {
        client_id: client.id, name: client.name, company: client.company,
        email: client.email, phone: client.phone, status: client.status,
        total_spent: client.totalSpent, last_contact: client.lastContact,
        assigned_to: client.assignedTo ?? null,
      };
      if (existing.data) {
        const { error } = await s.from("clients").update(row).eq("id", existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await s.from("clients").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await (supabase as any).from("clients").delete().eq("client_id", clientId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, remove };
}
