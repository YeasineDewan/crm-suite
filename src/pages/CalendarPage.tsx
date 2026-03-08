import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useOfficeEvents } from "@/hooks/useOfficeEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";

const EVENT_TYPES = [
  { id: "meeting", label: "Meeting", color: "#3b82f6" },
  { id: "deadline", label: "Deadline", color: "#ef4444" },
  { id: "leave", label: "Leave", color: "#f59e0b" },
  { id: "holiday", label: "Holiday", color: "#10b981" },
  { id: "other", label: "Other", color: "#8b5cf6" },
];

export default function CalendarPage() {
  const { data: events, isLoading, upsert, remove } = useOfficeEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [form, setForm] = useState({
    title: "", description: "", startDate: "", endDate: "", eventType: "meeting", color: "#3b82f6", allDay: true,
  });

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    const startDow = start.getDay();
    const padding = Array.from({ length: startDow }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - (startDow - i));
      return d;
    });
    return [...padding, ...allDays];
  }, [currentMonth]);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startDate), day));

  const openNew = () => {
    setEditEvent(null);
    setForm({ title: "", description: "", startDate: format(new Date(), "yyyy-MM-dd"), endDate: "", eventType: "meeting", color: "#3b82f6", allDay: true });
    setDialogOpen(true);
  };

  const openEdit = (event: any) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate ? event.endDate.split("T")[0] : "",
      eventType: event.eventType,
      color: event.color,
      allDay: event.allDay,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate) { toast.error("Title and start date are required"); return; }
    await upsert.mutateAsync({
      id: editEvent?.id,
      title: form.title,
      description: form.description,
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      eventType: form.eventType,
      createdBy: "System",
      color: form.color,
      allDay: form.allDay,
    });
    toast.success(editEvent ? "Event updated" : "Event created");
    setDialogOpen(false);
  };

  return (
    <DashboardLayout title="Office Calendar" subtitle="Manage meetings, deadlines, leaves and company events">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground min-w-[160px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Event</Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground border-b border-border bg-muted/50">{d}</div>
          ))}
          {days.map((day, i) => {
            const dayEvents = getEventsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            return (
              <div
                key={i}
                className={`min-h-[100px] p-1.5 border-b border-r border-border cursor-pointer hover:bg-muted/30 transition-colors ${
                  !inMonth ? "opacity-30" : ""
                } ${isToday(day) ? "bg-primary/5" : ""}`}
                onClick={() => {
                  setEditEvent(null);
                  setForm({ ...form, title: "", description: "", startDate: format(day, "yyyy-MM-dd"), endDate: "" });
                  setDialogOpen(true);
                }}
              >
                <span className={`text-xs font-medium ${isToday(day) ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : "text-foreground"}`}>
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-[10px] px-1 py-0.5 rounded truncate text-white cursor-pointer"
                      style={{ backgroundColor: ev.color }}
                      onClick={(e) => { e.stopPropagation(); openEdit(ev); }}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="mt-6 bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {events
            .filter((e) => new Date(e.startDate) >= new Date())
            .slice(0, 10)
            .map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(e.startDate), "MMM d, yyyy")} · {e.eventType}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(e)} className="h-7"><Edit className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { remove.mutate(e.id); toast.success("Event deleted"); }} className="h-7 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          {events.filter((e) => new Date(e.startDate) >= new Date()).length === 0 && (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editEvent ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Start Date</label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">End Date</label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.eventType} onValueChange={(v) => {
                const t = EVENT_TYPES.find((et) => et.id === v);
                setForm({ ...form, eventType: v, color: t?.color ?? form.color });
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10" />
            </div>
            <div className="flex justify-between">
              {editEvent && (
                <Button variant="destructive" size="sm" onClick={() => { remove.mutate(editEvent.id); setDialogOpen(false); toast.success("Deleted"); }}>
                  Delete
                </Button>
              )}
              <Button onClick={handleSave} className="ml-auto">{editEvent ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
