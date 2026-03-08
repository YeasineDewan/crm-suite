import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  assignedTo: string | null;
  assignedToName: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: string;
  tags: string[];
  createdAt: string;
}

export const TASK_STATUSES = [
  { id: "todo", label: "To Do", color: "hsl(220, 10%, 46%)" },
  { id: "in-progress", label: "In Progress", color: "hsl(210, 100%, 50%)" },
  { id: "review", label: "Review", color: "hsl(38, 92%, 50%)" },
  { id: "done", label: "Done", color: "hsl(142, 71%, 45%)" },
];

export function useTasks() {
  const qc = useQueryClient();
  const key = ["tasks"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((r): Task => ({
        id: r.id, taskId: r.task_id, title: r.title, description: r.description ?? "",
        assignedTo: r.assigned_to, assignedToName: r.assigned_to_name ?? "",
        status: r.status, priority: r.priority, dueDate: r.due_date,
        project: r.project ?? "", tags: r.tags ?? [], createdAt: r.created_at,
      }));
    },
  });

  const upsert = useMutation({
    mutationFn: async (t: Partial<Task> & { taskId: string; title: string }) => {
      const row = {
        task_id: t.taskId, title: t.title, description: t.description ?? "",
        assigned_to: t.assignedTo ?? null, assigned_to_name: t.assignedToName ?? "",
        status: t.status ?? "todo", priority: t.priority ?? "medium",
        due_date: t.dueDate ?? null, project: t.project ?? "", tags: t.tags ?? [],
      };
      const existing = await (supabase as any).from("tasks").select("id").eq("task_id", t.taskId).maybeSingle();
      if (existing.data) {
        const { error } = await (supabase as any).from("tasks").update(row).eq("id", existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("tasks").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, updateStatus, remove };
}
