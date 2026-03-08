import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  clockIn: string | null;
  clockOut: string | null;
  date: string;
  latitude: number | null;
  longitude: number | null;
  method: string;
  status: string;
  notes: string;
}

interface DbAttendance {
  id: string;
  employee_id: string;
  employee_name: string;
  clock_in: string | null;
  clock_out: string | null;
  date: string;
  latitude: number | null;
  longitude: number | null;
  method: string;
  status: string;
  notes: string;
}

const toRecord = (row: DbAttendance): AttendanceRecord => ({
  id: row.id,
  employeeId: row.employee_id,
  employeeName: row.employee_name,
  clockIn: row.clock_in,
  clockOut: row.clock_out,
  date: row.date,
  latitude: row.latitude,
  longitude: row.longitude,
  method: row.method,
  status: row.status,
  notes: row.notes ?? "",
});

export function useAttendance() {
  const qc = useQueryClient();
  const key = ["attendance"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("attendance")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as DbAttendance[]).map(toRecord);
    },
  });

  const clockIn = useMutation({
    mutationFn: async (params: {
      employeeId: string;
      employeeName: string;
      latitude?: number;
      longitude?: number;
      method: string;
    }) => {
      const { error } = await (supabase as any).from("attendance").insert({
        employee_id: params.employeeId,
        employee_name: params.employeeName,
        clock_in: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        latitude: params.latitude ?? null,
        longitude: params.longitude ?? null,
        method: params.method,
        status: "present",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const clockOut = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await (supabase as any)
        .from("attendance")
        .update({ clock_out: new Date().toISOString() })
        .eq("id", recordId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await (supabase as any)
        .from("attendance")
        .delete()
        .eq("id", recordId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, clockIn, clockOut, remove };
}
