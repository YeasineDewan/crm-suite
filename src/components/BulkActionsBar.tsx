import { Trash2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onStatusChange?: (status: string) => void;
  statusOptions?: string[];
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onExport,
  onStatusChange,
  statusOptions,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/5 border-b border-primary/20 animate-in slide-in-from-top-2">
      <span className="text-sm font-medium text-primary">{selectedCount} selected</span>
      <div className="flex items-center gap-1.5 ml-auto">
        {statusOptions && onStatusChange && (
          <select
            onChange={(e) => {
              if (e.target.value) onStatusChange(e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
            className="h-8 px-2 text-xs rounded-md border border-border bg-card text-foreground"
          >
            <option value="" disabled>Change status...</option>
            {statusOptions.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        )}
        {onExport && (
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onExport}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={onClear}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
