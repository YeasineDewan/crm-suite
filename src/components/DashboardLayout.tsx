import { CrmSidebar } from "@/components/CrmSidebar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Moon, Sun, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { containerRef, refreshing, pullDistance } = usePullToRefresh();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      {!isMobile && <CrmSidebar />}

      {/* Mobile sidebar sheet */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <CrmSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10 safe-area-top">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Toggle dark mode"
            >
              {dark ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <NotificationDropdown />
          </div>
        </header>
        <main ref={containerRef} className="flex-1 p-4 md:p-6 overflow-auto safe-area-bottom">
          <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />
          {children}
        </main>
      </div>
    </div>
  );
}
