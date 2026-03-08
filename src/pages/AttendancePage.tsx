import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Fingerprint, MapPin, Clock, LogIn, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AttendancePage() {
  const { data: records, isLoading, clockIn, clockOut, remove } = useAttendance();
  const { data: employees } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const getGPS = useCallback(() => {
    setGpsStatus("Fetching location...");
    if (!navigator.geolocation) {
      setGpsStatus("GPS not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus(`📍 ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => setGpsStatus("Location denied"),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleClockIn = async (method: string) => {
    if (!selectedEmployee) {
      toast.error("Select an employee first");
      return;
    }
    const emp = employees.find((e) => e.id === selectedEmployee);
    if (!emp) return;

    if (method === "gps" && !coords) {
      toast.error("Get GPS location first");
      return;
    }

    await clockIn.mutateAsync({
      employeeId: emp.id,
      employeeName: emp.name,
      latitude: coords?.lat,
      longitude: coords?.lng,
      method,
    });
    toast.success(`${emp.name} clocked in via ${method}`);
    setDialogOpen(false);
    setSelectedEmployee("");
    setCoords(null);
    setGpsStatus("");
  };

  const handleClockOut = async (recordId: string) => {
    await clockOut.mutateAsync(recordId);
    toast.success("Clocked out successfully");
  };

  const todayRecords = records.filter((r) => r.date === new Date().toISOString().split("T")[0]);

  return (
    <DashboardLayout title="Attendance" subtitle="Track employee check-in/check-out with GPS & fingerprint">
      {/* Clock-in Dialog */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><LogIn className="w-4 h-4" /> Clock In</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clock In Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={getGPS} className="gap-1">
                  <MapPin className="w-4 h-4" /> Get GPS
                </Button>
                {gpsStatus && <span className="text-xs text-muted-foreground">{gpsStatus}</span>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => handleClockIn("manual")} variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs">Manual</span>
                </Button>
                <Button onClick={() => handleClockIn("gps")} variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs">GPS</span>
                </Button>
                <Button onClick={() => handleClockIn("fingerprint")} variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
                  <Fingerprint className="w-5 h-5" />
                  <span className="text-xs">Fingerprint</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Today's Check-ins</p>
          <p className="text-2xl font-bold text-foreground">{todayRecords.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Clocked Out</p>
          <p className="text-2xl font-bold text-foreground">{todayRecords.filter((r) => r.clockOut).length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Still Working</p>
          <p className="text-2xl font-bold text-foreground">{todayRecords.filter((r) => !r.clockOut).length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">GPS Check-ins</p>
          <p className="text-2xl font-bold text-foreground">{todayRecords.filter((r) => r.method === "gps").length}</p>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Clock In</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Clock Out</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No attendance records yet</td></tr>
              ) : (
                records.slice(0, 50).map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground">{r.employeeName}</td>
                    <td className="p-3 text-muted-foreground">{r.date}</td>
                    <td className="p-3 text-muted-foreground">{r.clockIn ? format(new Date(r.clockIn), "HH:mm:ss") : "—"}</td>
                    <td className="p-3 text-muted-foreground">{r.clockOut ? format(new Date(r.clockOut), "HH:mm:ss") : "—"}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-xs">
                        {r.method === "gps" && <MapPin className="w-3 h-3" />}
                        {r.method === "fingerprint" && <Fingerprint className="w-3 h-3" />}
                        {r.method === "manual" && <Clock className="w-3 h-3" />}
                        {r.method}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {r.latitude ? `${r.latitude.toFixed(4)}, ${r.longitude?.toFixed(4)}` : "—"}
                    </td>
                    <td className="p-3"><StatusBadge status={r.clockOut ? "completed" : "active"} /></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {!r.clockOut && (
                          <Button size="sm" variant="outline" onClick={() => handleClockOut(r.id)} className="gap-1 h-7 text-xs">
                            <LogOut className="w-3 h-3" /> Out
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { remove.mutate(r.id); toast.success("Record deleted"); }} className="h-7 text-xs text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
