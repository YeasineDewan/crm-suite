import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EntityNotesProps {
  entityType: string;
  entityId: string;
}

export function EntityNotes({ entityType, entityId }: EntityNotesProps) {
  const { data: notes, isLoading, add, remove } = useNotes(entityType, entityId);
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (!content.trim()) return;
    add.mutate({ content: content.trim() }, {
      onSuccess: () => { setContent(""); toast.success("Note added"); },
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-foreground text-sm">Notes</h4>
        <span className="text-xs text-muted-foreground">({notes.length})</span>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          className="min-h-[60px] text-sm"
          onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleAdd(); }}
        />
        <Button size="icon" onClick={handleAdd} disabled={!content.trim() || add.isPending} className="shrink-0 self-end">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No notes yet.</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="bg-muted/30 rounded-lg p-3 group">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                <button
                  onClick={() => remove.mutate(note.id, { onSuccess: () => toast.success("Note deleted") })}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all shrink-0"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-medium text-muted-foreground">{note.authorName}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
