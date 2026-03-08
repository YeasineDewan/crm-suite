import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/data/mockData";

interface DbEmployee {
  id: string;
  emp_id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  join_date: string;
  avatar: string;
  performance: number;
}

const toEmployee = (row: DbEmployee): Employee => ({
  id: row.emp_id,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department,
  status: row.status as Employee["status"],
  joinDate: row.join_date,
  avatar: row.avatar,
  performance: row.performance,
});

async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await (supabase as any).from("employees").select("*").order("name");
  if (error) throw error;
  return (data as DbEmployee[]).map(toEmployee);
}

export function useEmployees() {
  const qc = useQueryClient();
  const key = ["employees"];

  const query = useQuery({ queryKey: key, queryFn: fetchEmployees });

  const upsert = useMutation({
    mutationFn: async (emp: Employee) => {
      const s = supabase as any;
      const existing = await s.from("employees").select("id").eq("emp_id", emp.id).maybeSingle();
      const row = {
        emp_id: emp.id, name: emp.name, email: emp.email, role: emp.role,
        department: emp.department, status: emp.status, join_date: emp.joinDate,
        avatar: emp.avatar, performance: emp.performance,
      };
      if (existing.data) {
        const { error } = await s.from("employees").update(row).eq("id", existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await s.from("employees").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (empId: string) => {
      const { error } = await (supabase as any).from("employees").delete().eq("emp_id", empId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, upsert, remove };
}
