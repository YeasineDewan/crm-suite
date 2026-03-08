import { Loader2 } from "lucide-react";

interface Props {
  pullDistance: number;
  refreshing: boolean;
}

export function PullToRefreshIndicator({ pullDistance, refreshing }: Props) {
  const show = pullDistance > 10 || refreshing;
  if (!show) return null;

  const progress = Math.min(pullDistance / 80, 1);

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all"
      style={{ height: refreshing ? 48 : pullDistance * 0.6 }}
    >
      <Loader2
        className="text-primary transition-opacity"
        style={{
          opacity: progress,
          animation: refreshing ? "spin 1s linear infinite" : "none",
          width: 24,
          height: 24,
        }}
      />
    </div>
  );
}
