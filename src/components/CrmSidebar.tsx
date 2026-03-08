import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingCart,
  Package,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Clients", url: "/clients", icon: Building2 },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Inventory", url: "/inventory", icon: Package },
];

const bottomItems = [
  { title: "Install App", url: "/install", icon: Download },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface CrmSidebarProps {
  onNavigate?: () => void;
}

export function CrmSidebar({ onNavigate }: CrmSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } min-h-screen`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <span className="text-sidebar-primary-foreground font-bold text-sm">C</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-sidebar-accent-foreground text-lg tracking-tight">
            CRM Pro
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            onClick={onNavigate}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="py-4 px-2 space-y-1 border-t border-sidebar-border">
        {bottomItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            onClick={onNavigate}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.title}</span>}
          </NavLink>
        ))}
        {!onNavigate && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors w-full"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
