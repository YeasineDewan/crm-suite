import { useRef, useEffect, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const THRESHOLD = 80;

export function usePullToRefresh() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    // Small delay so user sees the spinner
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, [queryClient]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0 && el.scrollTop <= 0) {
        setPullDistance(Math.min(diff * 0.5, THRESHOLD + 20));
      }
    };

    const onTouchEnd = () => {
      if (pullDistance >= THRESHOLD && !refreshing) {
        handleRefresh();
      }
      setPullDistance(0);
      pulling.current = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullDistance, refreshing, handleRefresh]);

  return { containerRef, refreshing, pullDistance };
}
