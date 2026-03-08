import { useEffect } from "react";
import { useQueryClient, onlineManager } from "@tanstack/react-query";
import { toast } from "sonner";
import { replayQueuedMutations } from "@/lib/backgroundSync";

export function useOfflineMutationSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = async () => {
      // Replay IndexedDB-queued background sync mutations
      const replayed = await replayQueuedMutations().catch(() => 0);

      // Resume TanStack Query paused mutations
      await queryClient.resumePausedMutations();
      queryClient.invalidateQueries();

      if (replayed > 0) {
        toast.success(`Back online — synced ${replayed} queued change${replayed > 1 ? "s" : ""}`);
      } else {
        toast.success("Back online — syncing changes");
      }
    };

    window.addEventListener("online", handleOnline);

    onlineManager.setEventListener((setOnline) => {
      const onlineHandler = () => setOnline(true);
      const offlineHandler = () => setOnline(false);
      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);
      return () => {
        window.removeEventListener("online", onlineHandler);
        window.removeEventListener("offline", offlineHandler);
      };
    });

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [queryClient]);
}
