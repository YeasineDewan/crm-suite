import { Settings2, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardConfig } from "@/hooks/useDashboardConfig";

interface DashboardCustomizerProps {
  config: DashboardConfig;
  toggleWidget: (id: string) => void;
  moveWidget: (from: number, to: number) => void;
  setDateRange: (range: DashboardConfig["dateRange"]) => void;
  reset: () => void;
}

export function DashboardCustomizer({
  config,
  toggleWidget,
  moveWidget,
  setDateRange,
  reset,
}: DashboardCustomizerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="w-4 h-4" /> Customize
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Dashboard Settings</h4>
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-xs gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date Range</label>
          <Select value={config.dateRange} onValueChange={(v) => setDateRange(v as DashboardConfig["dateRange"])}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Widgets</label>
          <div className="space-y-1">
            {config.widgets.map((w, i) => (
              <div
                key={w.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      disabled={i === 0}
                      onClick={() => moveWidget(i, i - 1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={i === config.widgets.length - 1}
                      onClick={() => moveWidget(i, i + 1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm text-foreground">{w.label}</span>
                </div>
                <Switch
                  checked={w.visible}
                  onCheckedChange={() => toggleWidget(w.id)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
