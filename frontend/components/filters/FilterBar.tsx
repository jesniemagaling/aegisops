"use client";

import { X, Filter } from "lucide-react";

export interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

export interface FilterValues {
  [key: string]: string;
}

interface FilterBarProps {
  filterOptions: FilterOption[];
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function FilterBar({
  filterOptions,
  filters,
  onChange,
  showFilters,
  onToggleFilters,
}: FilterBarProps) {
  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  function removeFilter(key: string) {
    const next = { ...filters };
    delete next[key];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map(([k, v]) => (
            <span
              key={k}
              className="flex items-center gap-1.5 bg-primary/[0.06] text-primary text-[11px] px-2.5 py-1 rounded-full border border-primary/10"
            >
              <span className="font-medium">{k}:</span> {v}
              <X
                className="w-3 h-3 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => removeFilter(k)}
              />
            </span>
          ))}
          <button
            onClick={() => onChange({})}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-card rounded-xl p-5 grid grid-cols-5 gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]">
          {filterOptions.map((opt) => (
            <div key={opt.key}>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block font-medium">
                {opt.label}
              </label>
              <select
                className="w-full bg-background border border-border/50 rounded-[10px] px-2.5 py-2 text-[12px] text-foreground transition-colors hover:border-border"
                value={filters[opt.key] || ""}
                onChange={(e) =>
                  onChange({ ...filters, [opt.key]: e.target.value })
                }
              >
                <option value="">All</option>
                {opt.options.map((o) => (
                  <option key={o} value={o}>
                    {o.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterToggleButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] bg-card rounded-[10px] hover:bg-muted transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-border/50"
    >
      <Filter className="w-3.5 h-3.5" /> Filters
      {activeCount > 0 && (
        <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
}
