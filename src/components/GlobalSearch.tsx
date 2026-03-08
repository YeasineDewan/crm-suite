import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SEARCH_ROUTES = [
  { path: "/", label: "Dashboard Overview", keywords: "home overview stats revenue" },
  { path: "/employees", label: "Employees", keywords: "staff team people hr" },
  { path: "/clients", label: "Clients", keywords: "customers contacts companies" },
  { path: "/orders", label: "Orders", keywords: "purchases transactions" },
  { path: "/inventory", label: "Inventory", keywords: "stock items products" },
  { path: "/attendance", label: "Attendance", keywords: "clock fingerprint gps checkin" },
  { path: "/calendar", label: "Office Calendar", keywords: "events meetings schedule" },
  { path: "/sales", label: "Sales Pipeline", keywords: "deals pipeline revenue crm" },
  { path: "/reports", label: "Reports & Analytics", keywords: "charts graphs data insights" },
  { path: "/expenses", label: "Expense Tracking", keywords: "costs spending budget receipts" },
  { path: "/leave", label: "Leave Management", keywords: "vacation sick absence time off" },
  { path: "/payroll", label: "Payroll", keywords: "salary wages deductions payslip" },
  { path: "/tasks", label: "Task Management", keywords: "todo projects kanban" },
  { path: "/settings", label: "Settings", keywords: "preferences config users roles" },
  { path: "/install", label: "Install App", keywords: "pwa download mobile" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.length > 0
    ? SEARCH_ROUTES.filter((r) =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.keywords.includes(query.toLowerCase())
      )
    : SEARCH_ROUTES;

  const handleSelect = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
    setQuery("");
  }, [navigate]);

  // Keyboard shortcut
  if (typeof window !== "undefined") {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.removeEventListener("keydown", handler);
    window.addEventListener("keydown", handler);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-sm text-muted-foreground w-full max-w-xs"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg">
          <div className="flex items-center gap-2 p-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, features..."
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-sm"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")}><X className="w-4 h-4 text-muted-foreground" /></button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {results.map((r) => (
              <button
                key={r.path}
                onClick={() => handleSelect(r.path)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between group"
              >
                <span className="text-sm font-medium text-foreground">{r.label}</span>
                <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{r.path}</span>
              </button>
            ))}
            {results.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
