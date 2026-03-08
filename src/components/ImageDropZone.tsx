import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageDropZoneProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
  className?: string;
}

export function ImageDropZone({ value, onChange, label = "Upload Image", className = "" }: ImageDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30">
          <img src={value} alt="Upload preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="p-1.5 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center h-40 gap-2 ${
            dragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            dragging ? "bg-primary/10" : "bg-muted"
          }`}>
            {dragging ? (
              <Upload className="w-5 h-5 text-primary animate-bounce" />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag & drop or <span className="text-primary">browse</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
