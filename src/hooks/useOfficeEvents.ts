import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OfficeEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  eventType: string;
  createdBy: string;
  color: string;
  allDay: boolean;
}

interface DbEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  event_type: string;
  created_by: string;
  color: string;
  all_day: boolean;
}

const toEvent = (row: DbEvent): OfficeEvent => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  startDate: row.start_date,
  endDate: row.end_date,
  eventType: row.event_type,
  createdBy: row.created_by ?? "System",
  color: row.color ?? "#3b82f6",
  allDay: row.all_day,
});

export function useOfficeEvents() {
  const qc = useQueryClient();
  const key = ["office_events"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("office_events")
        .select("*")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data as DbEvent[]).map(toEvent);
    },
  });

  const upsert = useMutation({
    mutationFn: async (event: Omit<OfficeEvent, "id"> & { id?: string }) => {
      const row = {
        title: event.title,
        description: event.description,
        start_date: event.startDate,
        end_date: event.endDate,
        event_type: event.eventType,
        created_by: event.createdBy,
        color: event.color,
        all_day: event.allDay,
      };
      if (event.id) {
        const { error } = await (supabase as any)
          .from("office_events")
          .update(row)
          .eq("id", event.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("office_events").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await (supabase as any)
        .from("office_events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, remove };
}
