import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TABLE_TO_QUERY_KEY: Record<string, string[]> = {
  orders: ["orders"],
  clients: ["clients"],
  employees: ["employees"],
  inventory_items: ["inventory"],
  activity_log: ["activity_log"],
};

export function useRealtimeSync(): void {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("global-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        (payload) => {
          const table = payload.table;
          const key = TABLE_TO_QUERY_KEY[table];
          if (key) {
            qc.invalidateQueries({ queryKey: key });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
