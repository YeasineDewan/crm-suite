import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface DbActivity {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description: string;
  metadata: any;
  created_at: string;
}

const toEntry = (row: DbActivity): ActivityEntry => ({
  id: row.id,
  entityType: row.entity_type,
  entityId: row.entity_id,
  action: row.action,
  description: row.description,
  metadata: row.metadata ?? {},
  createdAt: row.created_at,
});

export function useActivityLog(limit = 50) {
  const qc = useQueryClient();
  const key = ["activity_log"];

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<ActivityEntry[]> => {
      const { data, error } = await (supabase as any)
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as DbActivity[]).map(toEntry);
    },
  });

  const log = useMutation({
    mutationFn: async (entry: { entityType: string; entityId: string; action: string; description: string; metadata?: Record<string, any> }) => {
      const { error } = await (supabase as any).from("activity_log").insert({
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        action: entry.action,
        description: entry.description,
        metadata: entry.metadata ?? {},
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, log };
}
