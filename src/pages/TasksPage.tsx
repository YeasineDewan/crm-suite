import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTasks, TASK_STATUSES } from "@/hooks/useTasks";
import { useEmployees } from "@/hooks/useEmployees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, ChevronRight, ListTodo, Clock, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const { data: tasks, isLoading, upsert, updateStatus, remove } = useTasks();
  const { data: employees } = useEmployees();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", assignedTo: "", priority: "medium", dueDate: "", project: "", status: "todo",
  });

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNew = () => {
    setEditTask(null);
    setForm({ title: "", description: "", assignedTo: "", priority: "medium", dueDate: "", project: "", status: "todo" });
    setDialogOpen(true);
  };

  const openEdit = (task: any) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description, assignedTo: task.assignedTo ?? "",
      priority: task.priority, dueDate: task.dueDate ?? "", project: task.project, status: task.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    const emp = employees.find((e) => e.id === form.assignedTo);
    await upsert.mutateAsync({
      taskId: editTask?.taskId ?? `TSK-${Date.now().toString().slice(-6)}`,
      title: form.title, description: form.description,
      assignedTo: form.assignedTo || null, assignedToName: emp?.name ?? "",
      priority: form.priority, dueDate: form.dueDate || null,
      project: form.project, status: form.status, tags: [],
    });
    toast.success(editTask ? "Updated" : "Task created");
    setDialogOpen(false);
  };

  const moveToNext = (task: any) => {
    const idx = TASK_STATUSES.findIndex((s) => s.id === task.status);
    if (idx < TASK_STATUSES.length - 1) {
      updateStatus.mutate({ id: task.id, status: TASK_STATUSES[idx + 1].id });
      toast.success(`Moved to ${TASK_STATUSES[idx + 1].label}`);
    }
  };

  return (
    <DashboardLayout title="Task Management" subtitle="Assign tasks, track progress and manage projects">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {TASK_STATUSES.map((s, i) => (
          <div key={s.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{tasks.filter((t) => t.status === s.id).length}</p>
          </div>
        ))}
      </div>

      {/* Search & Add */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, assignees, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> New Task</Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {TASK_STATUSES.map((status) => {
          const statusTasks = filteredTasks.filter((t) => t.status === status.id);
          return (
            <div key={status.id} className="bg-card rounded-xl border border-border min-h-[300px]">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-sm font-medium text-foreground">{status.label}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{statusTasks.length}</span>
              </div>
              <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                {statusTasks.map((task) => (
                  <div key={task.id} className="bg-background rounded-lg border border-border p-3 hover:shadow-sm transition-all hover:-translate-y-0.5">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground leading-tight flex-1">{task.title}</h4>
                      <div className="flex gap-0.5 ml-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEdit(task)}><Edit className="w-3 h-3" /></Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => { remove.mutate(task.id); toast.success("Deleted"); }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>}
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        task.priority === "high" ? "bg-destructive/10 text-destructive" :
                        task.priority === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                      }`}>{task.priority}</span>
                      {task.project && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{task.project}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {task.assignedToName && <span className="text-[10px] text-muted-foreground">👤 {task.assignedToName}</span>}
                        {task.dueDate && <span className="text-[10px] text-muted-foreground ml-2">📅 {task.dueDate}</span>}
                      </div>
                      {status.id !== "done" && (
                        <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1" onClick={() => moveToNext(task)}>
                          Next <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {statusTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTask ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.assignedTo || "unassigned"} onValueChange={(v) => setForm({ ...form, assignedTo: v === "unassigned" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Assign to" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} placeholder="Due date" />
              <Input placeholder="Project name" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} />
            </div>
            {editTask && (
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <div className="flex justify-between">
              {editTask && (
                <Button variant="destructive" size="sm" onClick={() => { remove.mutate(editTask.id); setDialogOpen(false); toast.success("Deleted"); }}>Delete</Button>
              )}
              <Button onClick={handleSave} className="ml-auto">{editTask ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
