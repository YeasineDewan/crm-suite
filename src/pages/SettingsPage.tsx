import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageDropZone } from "@/components/ImageDropZone";
import { StatusBadge } from "@/components/StatusBadge";
import { useActivityLog, type ActivityEntry } from "@/hooks/useActivityLog";
import { useClients } from "@/hooks/useClients";
import { useOrders } from "@/hooks/useOrders";
import { useEmployees } from "@/hooks/useEmployees";
import { useInventory } from "@/hooks/useInventory";
import { exportToCSV, exportMultipleCSV } from "@/lib/csvExport";
import { useUserManagement, type AppRole } from "@/hooks/useUserManagement";
import { toast } from "sonner";
import {
  User, Bell, Palette, Save, Moon, Sun, Monitor,
  Download, Upload, History, Database, Shield,
  FileDown, FileUp, Package, ShoppingCart, Users, Building2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [profileForm, setProfileForm] = useState({ displayName: "Admin User", avatarUrl: "" });
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (document.documentElement.classList.contains("dark")) return "dark";
    return "light";
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    lowStock: true,
    newClients: true,
    employeeChanges: false,
    emailDigest: true,
  });

  const { data: activityData, isLoading: activityLoading } = useActivityLog(100);
  const { data: clients } = useClients();
  const { data: orders } = useOrders();
  const { data: employees } = useEmployees();
  const { data: inventory } = useInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: usersData, isLoading: usersLoading, updateRole } = useUserManagement();

  const handleThemeChange = (t: "light" | "dark" | "system") => {
    setTheme(t);
    if (t === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    toast.success(`Theme set to ${t}`);
  };

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleExportAll = () => {
    exportMultipleCSV([
      { data: clients, filename: "clients", columns: [{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "company", label: "Company" }, { key: "email", label: "Email" }, { key: "status", label: "Status" }, { key: "totalSpent", label: "Total Spent" }] },
      { data: orders, filename: "orders", columns: [{ key: "id", label: "ID" }, { key: "clientName", label: "Client" }, { key: "total", label: "Total" }, { key: "status", label: "Status" }, { key: "date", label: "Date" }] },
      { data: employees, filename: "employees", columns: [{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "department", label: "Dept" }] },
      { data: inventory, filename: "inventory", columns: [{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "sku", label: "SKU" }, { key: "quantity", label: "Qty" }, { key: "price", label: "Price" }] },
    ]);
    toast.success("All data exported as CSV files");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) {
        toast.error("CSV file appears empty");
        return;
      }
      toast.success(`Parsed ${lines.length - 1} rows from ${file.name}. Import processing is not yet fully implemented.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const actionColor = (action: string) => {
    if (action === "created") return "text-emerald-500";
    if (action === "updated") return "text-blue-500";
    if (action === "deleted") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account, data, and preferences.">
      <div className="max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="profile" className="gap-1.5"><User className="w-4 h-4" /> Profile</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5"><Palette className="w-4 h-4" /> Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5"><Database className="w-4 h-4" /> Data</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5"><Shield className="w-4 h-4" /> Users</TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5"><History className="w-4 h-4" /> Activity Log</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Label className="mb-3 block">Profile Photo</Label>
                  <ImageDropZone
                    value={profileForm.avatarUrl || undefined}
                    onChange={(img) => setProfileForm({ ...profileForm, avatarUrl: img || "" })}
                    label="Upload Photo"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <Button onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-1.5" /> Save Profile
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
                <p className="text-sm text-muted-foreground">Customize how the CRM looks</p>
              </div>
              <div>
                <Label className="mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: "light" as const, icon: Sun, label: "Light" },
                    { value: "dark" as const, icon: Moon, label: "Dark" },
                    { value: "system" as const, icon: Monitor, label: "System" },
                  ]).map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${theme === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Accent Color</Label>
                <div className="flex gap-3">
                  {[
                    { color: "hsl(210, 100%, 50%)", name: "Blue" },
                    { color: "hsl(168, 80%, 42%)", name: "Teal" },
                    { color: "hsl(262, 83%, 58%)", name: "Purple" },
                    { color: "hsl(38, 92%, 50%)", name: "Amber" },
                    { color: "hsl(0, 72%, 51%)", name: "Red" },
                  ].map(({ color, name }) => (
                    <button
                      key={name}
                      className="w-10 h-10 rounded-full border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={name}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Color customization coming soon</p>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">Choose what you want to be notified about</p>
              </div>
              <div className="space-y-4">
                {[
                  { key: "orderUpdates" as const, label: "Order Updates", desc: "Get notified when orders change status" },
                  { key: "lowStock" as const, label: "Low Stock Alerts", desc: "Alert when inventory items are running low" },
                  { key: "newClients" as const, label: "New Clients", desc: "Notification when new clients are added" },
                  { key: "employeeChanges" as const, label: "Employee Changes", desc: "Updates about team member changes" },
                  { key: "emailDigest" as const, label: "Daily Email Digest", desc: "Receive a daily summary via email" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-1.5" /> Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Data Export</h3>
                  <p className="text-sm text-muted-foreground">Download your CRM data as CSV files</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => exportToCSV(clients, "clients", [{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "company", label: "Company" }, { key: "email", label: "Email" }, { key: "status", label: "Status" }, { key: "totalSpent", label: "Total Spent" }])}>
                    <Building2 className="w-4 h-4 mr-2" /> Export Clients
                  </Button>
                  <Button variant="outline" onClick={() => exportToCSV(orders, "orders", [{ key: "id", label: "ID" }, { key: "clientName", label: "Client" }, { key: "total", label: "Total" }, { key: "status", label: "Status" }, { key: "date", label: "Date" }])}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Export Orders
                  </Button>
                  <Button variant="outline" onClick={() => exportToCSV(employees, "employees", [{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "role", label: "Role" }, { key: "department", label: "Dept" }])}>
                    <Users className="w-4 h-4 mr-2" /> Export Employees
                  </Button>
                  <Button variant="outline" onClick={() => exportToCSV(inventory, "inventory", [{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "sku", label: "SKU" }, { key: "quantity", label: "Qty" }, { key: "price", label: "Price" }])}>
                    <Package className="w-4 h-4 mr-2" /> Export Inventory
                  </Button>
                </div>
                <Button onClick={handleExportAll}>
                  <FileDown className="w-4 h-4 mr-1.5" /> Export All Data
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Data Import</h3>
                  <p className="text-sm text-muted-foreground">Import data from CSV files</p>
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="w-4 h-4 mr-1.5" /> Import CSV
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Supported format: CSV with headers matching existing table columns</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">User Management</h3>
                <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
              </div>
              {usersLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading users...</p>
              ) : usersData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No users found. Users appear here after signing up.</p>
              ) : (
                <div className="space-y-1">
                  {usersData.map((u) => (
                    <div key={u.roleId} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {u.displayName?.slice(0, 2).toUpperCase() || "??"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.displayName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{u.userId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <Select
                        value={u.role}
                        onValueChange={(val) => {
                          updateRole.mutate({ roleId: u.roleId, newRole: val as AppRole }, {
                            onSuccess: () => toast.success(`Role updated to ${val}`),
                            onError: () => toast.error("Failed to update role. You may need admin permissions."),
                          });
                        }}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Activity Log</h3>
                  <p className="text-sm text-muted-foreground">Track all changes across your CRM</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToCSV(activityData, "activity_log", [
                  { key: "createdAt", label: "Date" }, { key: "entityType", label: "Entity" },
                  { key: "entityId", label: "ID" }, { key: "action", label: "Action" },
                  { key: "description", label: "Description" },
                ])}>
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
              </div>
              {activityLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading activity...</p>
              ) : activityData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No activity yet. Changes will appear here.</p>
              ) : (
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {activityData.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        entry.action === "created" ? "bg-emerald-500" : entry.action === "deleted" ? "bg-destructive" : "bg-blue-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-medium capitalize ${actionColor(entry.action)}`}>{entry.action}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground capitalize">{entry.entityType}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
