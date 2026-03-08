import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  entityType: string;
  entityId: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface DbNote {
  id: string;
  entity_type: string;
  entity_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

const toNote = (row: DbNote): Note => ({
  id: row.id,
  entityType: row.entity_type,
  entityId: row.entity_id,
  content: row.content,
  authorName: row.author_name,
  createdAt: row.created_at,
});

export function useNotes(entityType: string, entityId: string) {
  const qc = useQueryClient();
  const key = ["notes", entityType, entityId];

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await (supabase as any)
        .from("notes")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as DbNote[]).map(toNote);
    },
    enabled: !!entityId,
  });

  const add = useMutation({
    mutationFn: async (note: { content: string; authorName?: string }) => {
      const { error } = await (supabase as any).from("notes").insert({
        entity_type: entityType,
        entity_id: entityId,
        content: note.content,
        author_name: note.authorName || "Admin",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await (supabase as any).from("notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, add, remove };
}
