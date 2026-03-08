import { Search, ArrowUpDown } from "lucide-react";

interface TableToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function TableToolbar({ search, onSearchChange, placeholder = "Search...", children }: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-ring w-64 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort?: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}

export function SortableHeader({ label, sortKey, currentSort, sortDir, onSort }: SortableHeaderProps) {
  const active = currentSort === sortKey;
  return (
    <th
      className="text-left px-5 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${active ? "text-primary" : "opacity-40"}`} />
        {active && <span className="text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
      </span>
    </th>
  );
}
