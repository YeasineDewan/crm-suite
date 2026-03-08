import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "employee";

export interface UserWithRole {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: AppRole;
  roleId: string;
}

export function useUserManagement() {
  const qc = useQueryClient();
  const key = ["user_management"];

  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<UserWithRole[]> => {
      const { data: roles, error: rolesErr } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (rolesErr) throw rolesErr;

      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url");
      if (profErr) throw profErr;

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      return (roles || []).map((r) => {
        const profile = profileMap.get(r.user_id);
        return {
          userId: r.user_id,
          displayName: profile?.display_name || "Unknown",
          avatarUrl: profile?.avatar_url || null,
          role: r.role as AppRole,
          roleId: r.id,
        };
      });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ roleId, newRole }: { roleId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { data: query.data ?? [], isLoading: query.isLoading, updateRole };
}
