import { useState, useMemo } from "react";

interface UseDataTableOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  pageSize?: number;
  defaultSort?: keyof T;
  defaultSortDir?: "asc" | "desc";
}

export function useDataTable<T extends Record<string, any>>({
  data,
  searchFields,
  pageSize = 8,
  defaultSort,
  defaultSortDir = "asc",
}: UseDataTableOptions<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSort);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(q)
        )
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir, searchFields]);

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
  };
}
