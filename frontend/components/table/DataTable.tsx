"use client";

import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
}

interface PaginationInfo {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  pagination,
  onPageChange,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl card-shadow">
        <div className="p-4 space-y-3">
          <div className="h-8 bg-muted rounded-lg animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-6 bg-muted rounded-lg animate-pulse flex-[2]" />
              <div className="h-6 bg-muted rounded-lg animate-pulse flex-[3]" />
              <div className="h-6 bg-muted rounded-lg animate-pulse flex-1" />
              <div className="h-6 bg-muted rounded-lg animate-pulse flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card rounded-xl card-shadow">
        <div className="flex h-48 items-center justify-center text-[12px] text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const startItem = pagination
    ? (pagination.page - 1) * pagination.size + 1
    : 1;
  const endItem = pagination
    ? Math.min(pagination.page * pagination.size, pagination.totalItems)
    : data.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-xl overflow-auto card-shadow">
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_0_var(--border)]">
            <tr className="text-muted-foreground">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.align === "right" ? "text-right" : "text-left"} px-4 py-3 font-medium whitespace-nowrap ${
                    onSort
                      ? "cursor-pointer hover:text-foreground select-none transition-colors"
                      : ""
                  } ${col.className ?? ""}`}
                  onClick={onSort ? () => onSort(col.key) : undefined}
                >
                  <span
                    className={`inline-flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`}
                  >
                    {col.header}
                    {sortColumn === col.key &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border/30 hover:bg-primary/[0.02] transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                } ${i % 2 === 1 ? "bg-muted/20" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""} ${col.className ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>
            Showing {startItem}-{endItem} of{" "}
            {pagination.totalItems.toLocaleString()} transactions
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {generatePageNumbers(pagination.page, pagination.totalPages).map(
              (p, i) =>
                p === null ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`min-w-[32px] h-8 rounded-lg text-[12px] transition-colors ${
                      p === pagination.page
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ),
            )}
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | null)[] = [1];
  if (current > 3) pages.push(null);
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push(null);
  pages.push(total);
  return pages;
}
