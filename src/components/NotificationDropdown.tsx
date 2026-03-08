import { useState } from "react";
import { Bell, Check, CheckCheck, Package, ShoppingCart, Users, Building2 } from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "employee" | "client" | "inventory" | "system";
  time: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  { id: "n1", title: "New Order Received", message: "ORD-009 from Global Solutions — $9,800", type: "order", time: "2 min ago", read: false },
  { id: "n2", title: "Low Stock Alert", message: "Pro Subscription (SUB-PRO-001) is running low", type: "inventory", time: "15 min ago", read: false },
  { id: "n3", title: "Employee On Leave", message: "Emily Davis started leave today", type: "employee", time: "1 hr ago", read: false },
  { id: "n4", title: "Client Payment", message: "Acme Corp paid $12,500 for ORD-001", type: "client", time: "3 hrs ago", read: true },
  { id: "n5", title: "Order Shipped", message: "ORD-002 shipped to TechStart Inc", type: "order", time: "5 hrs ago", read: true },
  { id: "n6", title: "New Client Added", message: "Sunrise Media Group added as prospect", type: "client", time: "1 day ago", read: true },
];

const iconMap = {
  order: ShoppingCart,
  employee: Users,
  client: Building2,
  inventory: Package,
  system: Bell,
};

const colorMap = {
  order: "text-primary",
  employee: "text-accent",
  client: "text-[hsl(var(--chart-3))]",
  inventory: "text-warning",
  system: "text-muted-foreground",
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-destructive-foreground">{unreadCount}</span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map(n => {
                const Icon = iconMap[n.type];
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${
                      !n.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className={`mt-0.5 ${colorMap[n.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-border text-center">
              <button className="text-xs text-primary hover:underline">View all notifications</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
