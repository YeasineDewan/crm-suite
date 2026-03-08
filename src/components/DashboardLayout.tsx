import { CrmSidebar } from "@/components/CrmSidebar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { Search, Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { displayName, signOut, roles } = useAuth();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const initials = displayName
    ? displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleBadge = roles.includes("admin") ? "Admin" : roles.includes("manager") ? "Manager" : "Employee";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <CrmSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm bg-muted rounded-lg border-none outline-none focus:ring-2 focus:ring-ring w-56 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Toggle dark mode"
            >
              {dark ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <NotificationDropdown />
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-semibold">{initials}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-medium text-foreground leading-tight">{displayName || "User"}</p>
                <p className="text-[10px] text-muted-foreground">{roleBadge}</p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
