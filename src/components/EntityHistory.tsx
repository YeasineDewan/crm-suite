import { useActivityLog } from "@/hooks/useActivityLog";
import { History } from "lucide-react";

interface EntityHistoryProps {
  entityType: string;
  entityId: string;
}

export function EntityHistory({ entityType, entityId }: EntityHistoryProps) {
  const { data: allActivity, isLoading } = useActivityLog(200);
  const history = allActivity.filter(
    (a) => a.entityType === entityType && a.entityId === entityId
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-foreground text-sm">Activity History</h4>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : history.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No history recorded.</p>
      ) : (
        <div className="space-y-1 max-h-[250px] overflow-y-auto">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 py-1.5">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                entry.action === "created" ? "bg-emerald-500" : entry.action === "deleted" ? "bg-destructive" : "bg-blue-500"
              }`} />
              <div>
                <p className="text-xs text-foreground">{entry.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
