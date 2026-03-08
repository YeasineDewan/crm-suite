import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  paidOn: string | null;
  notes: string;
}

export function usePayroll() {
  const qc = useQueryClient();
  const key = ["payroll"];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("payroll").select("*").order("month", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((r): PayrollRecord => ({
        id: r.id, employeeId: r.employee_id, employeeName: r.employee_name,
        month: r.month, basicSalary: Number(r.basic_salary), allowances: Number(r.allowances),
        deductions: Number(r.deductions), netSalary: Number(r.net_salary),
        status: r.status, paidOn: r.paid_on, notes: r.notes ?? "",
      }));
    },
  });

  const upsert = useMutation({
    mutationFn: async (p: Omit<PayrollRecord, "id"> & { id?: string }) => {
      const row = {
        employee_id: p.employeeId, employee_name: p.employeeName, month: p.month,
        basic_salary: p.basicSalary, allowances: p.allowances, deductions: p.deductions,
        net_salary: p.netSalary, status: p.status, paid_on: p.paidOn, notes: p.notes,
      };
      if (p.id) {
        const { error } = await (supabase as any).from("payroll").update(row).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("payroll").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("payroll").update({ status: "paid", paid_on: new Date().toISOString().split("T")[0] }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("payroll").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, markPaid, remove };
}
