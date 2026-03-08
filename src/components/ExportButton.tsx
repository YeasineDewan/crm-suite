import { Download, FileDown, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
  onExportAll: () => void;
  onExportFiltered?: () => void;
  filteredCount?: number;
}

export function ExportButton({ onExportAll, onExportFiltered, filteredCount }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => onExportFiltered ? setOpen(!open) : onExportAll()}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors text-foreground"
      >
        <Download className="w-4 h-4" />
        Export
        {onExportFiltered && <ChevronDown className="w-3 h-3" />}
      </button>

      {open && onExportFiltered && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={() => { onExportAll(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
            >
              <FileDown className="w-4 h-4" /> Export All
            </button>
            <button
              onClick={() => { onExportFiltered(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-foreground border-t border-border"
            >
              <Download className="w-4 h-4" /> Export Filtered{filteredCount !== undefined ? ` (${filteredCount})` : ""}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
