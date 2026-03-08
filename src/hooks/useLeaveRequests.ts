import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  approvedBy: string | null;
}

export const LEAVE_TYPES = ["casual", "sick", "annual", "maternity", "paternity", "unpaid"];

export function useLeaveRequests() {
  const qc = useQueryClient();
  const key = ["leave_requests"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("leave_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((r): LeaveRequest => ({
        id: r.id, employeeId: r.employee_id, employeeName: r.employee_name,
        leaveType: r.leave_type, startDate: r.start_date, endDate: r.end_date,
        days: r.days, reason: r.reason ?? "", status: r.status, approvedBy: r.approved_by,
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (req: Omit<LeaveRequest, "id" | "approvedBy">) => {
      const { error } = await (supabase as any).from("leave_requests").insert({
        employee_id: req.employeeId, employee_name: req.employeeName,
        leave_type: req.leaveType, start_date: req.startDate, end_date: req.endDate,
        days: req.days, reason: req.reason, status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const approve = useMutation({
    mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
      const { error } = await (supabase as any).from("leave_requests").update({ status: "approved", approved_by: approvedBy }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const reject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("leave_requests").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("leave_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, create, approve, reject, remove };
}
