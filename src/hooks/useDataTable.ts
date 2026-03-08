import { useState, useMemo, useCallback } from "react";

interface UseDataTableOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  pageSize?: number;
  defaultSort?: keyof T;
  defaultSortDir?: "asc" | "desc";
  filterableFields?: { key: keyof T; values: string[] }[];
}

export function useDataTable<T extends Record<string, any>>({
  data,
  searchFields,
  pageSize = 8,
  defaultSort,
  defaultSortDir = "asc",
  filterableFields = [],
}: UseDataTableOptions<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSort);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const filtered = useMemo(() => {
    let result = data;

    // Apply search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(q)
        )
      );
    }

    // Apply filters
    for (const [key, values] of Object.entries(activeFilters)) {
      if (values.length > 0) {
        result = result.filter((item) => values.includes(String(item[key])));
      }
    }

    // Apply sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir, searchFields, activeFilters]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = paginated.map((item) => String(item.id));
    setSelectedIds((prev) => {
      const allSelected = allIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set([...prev, ...allIds]);
    });
  }, [paginated]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const setFilter = useCallback((key: string, values: string[]) => {
    setActiveFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setPage(1);
  }, []);

  const filterOptions = useMemo(() => {
    return filterableFields.map((f) => ({
      key: String(f.key),
      label: String(f.key).charAt(0).toUpperCase() + String(f.key).slice(1),
      values: f.values,
    }));
  }, [filterableFields]);

  return {
    search,
    setSearch,
    sortKey,
    sortDir,
    toggleSort,
    page,
    setPage,
    totalPages,
    filtered,
    paginated,
    total: filtered.length,
    // Selection
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    // Filters
    activeFilters,
    setFilter,
    clearFilters,
    filterOptions,
  };
}
