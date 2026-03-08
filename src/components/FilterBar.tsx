import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterOption {
  key: string;
  label: string;
  values: string[];
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
}

export function FilterBar({ filters, activeFilters, onFilterChange, onClearAll }: FilterBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const hasActive = Object.values(activeFilters).some((v) => v.length > 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="w-4 h-4 text-muted-foreground" />
      {filters.map((filter) => {
        const active = activeFilters[filter.key] ?? [];
        return (
          <div key={filter.key} className="relative">
            <button
              onClick={() => setOpenFilter(openFilter === filter.key ? null : filter.key)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                active.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
              {active.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px]">
                  {active.length}
                </span>
              )}
            </button>
            {openFilter === filter.key && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenFilter(null)} />
                <div className="absolute left-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-50 p-2 space-y-1">
                  {filter.values.map((val) => {
                    const checked = active.includes(val);
                    return (
                      <label key={val} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-xs text-foreground">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked ? active.filter((v) => v !== val) : [...active, val];
                            onFilterChange(filter.key, next);
                          }}
                          className="rounded border-border"
                        />
                        <span className="capitalize">{val}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })}
      {hasActive && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );
}
