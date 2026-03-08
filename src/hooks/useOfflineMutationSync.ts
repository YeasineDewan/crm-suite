import { useEffect } from "react";
import { useQueryClient, onlineManager } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * When the app comes back online, resume any paused mutations
 * and refetch stale queries automatically.
 */
export function useOfflineMutationSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // TanStack Query's onlineManager already pauses mutations when offline.
    // We just need to listen for connectivity restore and trigger a refetch.
    const handleOnline = () => {
      // Resume paused mutations
      queryClient.resumePausedMutations().then(() => {
        // Invalidate all queries to get fresh data
        queryClient.invalidateQueries();
        toast.success("Back online — syncing changes");
      });
    };

    window.addEventListener("online", handleOnline);

    // Ensure onlineManager tracks browser state
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
