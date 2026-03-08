import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageDropZone } from "@/components/ImageDropZone";
import { toast } from "sonner";
import { User, Bell, Palette, Save, Moon, Sun, Monitor } from "lucide-react";

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

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and preferences.">
      <div className="max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="profile" className="gap-1.5"><User className="w-4 h-4" /> Profile</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5"><Palette className="w-4 h-4" /> Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
