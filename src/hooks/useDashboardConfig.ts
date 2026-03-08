import { useState, useCallback } from "react";

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
}

export interface DashboardConfig {
  widgets: WidgetConfig[];
  dateRange: "7d" | "30d" | "90d" | "all";
}

const STORAGE_KEY = "crm_dashboard_config";

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "stats", label: "Stat Cards", visible: true },
  { id: "revenue-chart", label: "Revenue Chart", visible: true },
  { id: "order-status", label: "Order Status Pie", visible: true },
  { id: "orders-bar", label: "Orders by Month", visible: true },
  { id: "recent-orders", label: "Recent Orders", visible: true },
  { id: "top-clients", label: "Top Clients", visible: true },
];

function loadConfig(): DashboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults in case new widgets were added
      const existingIds = new Set(parsed.widgets?.map((w: WidgetConfig) => w.id) ?? []);
      const merged = [
        ...(parsed.widgets ?? []),
        ...DEFAULT_WIDGETS.filter((w) => !existingIds.has(w.id)),
      ];
      return { widgets: merged, dateRange: parsed.dateRange ?? "all" };
    }
  } catch {}
  return { widgets: DEFAULT_WIDGETS, dateRange: "all" };
}

export function useDashboardConfig() {
  const [config, setConfigState] = useState<DashboardConfig>(loadConfig);

  const save = useCallback((next: DashboardConfig) => {
    setConfigState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleWidget = useCallback(
    (id: string) => {
      const next = {
        ...config,
        widgets: config.widgets.map((w) =>
          w.id === id ? { ...w, visible: !w.visible } : w
        ),
      };
      save(next);
    },
    [config, save]
  );

  const moveWidget = useCallback(
    (fromIndex: number, toIndex: number) => {
      const arr = [...config.widgets];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      save({ ...config, widgets: arr });
    },
    [config, save]
  );

  const setDateRange = useCallback(
    (dateRange: DashboardConfig["dateRange"]) => {
      save({ ...config, dateRange });
    },
    [config, save]
  );

  const isVisible = useCallback(
    (id: string) => config.widgets.find((w) => w.id === id)?.visible ?? true,
    [config]
  );

  const reset = useCallback(() => {
    save({ widgets: DEFAULT_WIDGETS, dateRange: "all" });
  }, [save]);

  return { config, toggleWidget, moveWidget, setDateRange, isVisible, reset };
}
