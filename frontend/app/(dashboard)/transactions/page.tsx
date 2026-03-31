"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { getTransactions } from "@/lib/api";
import { useApi } from "@/hooks";
import { DataTable, type Column } from "@/components/table";
import {
  FilterBar,
  FilterToggleButton,
  type FilterValues,
} from "@/components/filters";
import { StatusBadge, Button } from "@/components/ui";
import type { PaginatedData, Transaction } from "@/types";

const FILTER_OPTIONS = [
  {
    key: "source",
    label: "Source",
    options: ["SAP", "Oracle", "Stripe", "Plaid", "Internal"],
  },
  {
    key: "lifecycle",
    label: "Lifecycle",
    options: ["INGESTED", "VALIDATED", "RECONCILED", "REVIEWED", "EXPORTED"],
  },
  {
    key: "validation",
    label: "Validation",
    options: ["VALID", "WARNING", "INVALID"],
  },
  {
    key: "reconciliation",
    label: "Reconciliation",
    options: ["MATCHED", "MISMATCHED", "MISSING", "NEEDS_REVIEW"],
  },
  {
    key: "review",
    label: "Review",
    options: ["PENDING_REVIEW", "RESOLVED", "ESCALATED"],
  },
];

const COLUMNS: Column<Transaction>[] = [
  {
    key: "id",
    header: "ID",
    render: (tx) => (
      <span className="text-primary font-medium">
        {tx.externalTransactionId || tx.id.slice(0, 12)}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    render: (tx) => (
      <span className="text-muted-foreground tabular-nums whitespace-nowrap">
        {tx.occurredAt}
      </span>
    ),
  },
  {
    key: "source",
    header: "Source",
    render: (tx) => (
      <span className="text-foreground font-medium">{tx.sourceSystemId}</span>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (tx) => (
      <span className="text-muted-foreground">{tx.transactionType}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (tx) => (
      <span className="tabular-nums text-foreground font-medium whitespace-nowrap">
        <span className="text-muted-foreground font-normal">{tx.currency}</span>{" "}
        {(tx.amountIn || tx.amountOut).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    key: "lifecycle",
    header: "Lifecycle",
    render: (tx) => <StatusBadge status={tx.lifecycleStatus} size="xs" />,
  },
  {
    key: "validation",
    header: "Validation",
    render: (tx) => <StatusBadge status={tx.validationStatus} size="xs" />,
  },
  {
    key: "reconciliation",
    header: "Recon",
    render: (tx) => <StatusBadge status={tx.reconciliationStatus} size="xs" />,
  },
  {
    key: "review",
    header: "Review",
    render: (tx) => <StatusBadge status={tx.reviewStatus} size="xs" />,
  },
];

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(() => {
    const f: FilterValues = {};
    for (const [k, v] of searchParams.entries()) {
      f[k] = v;
    }
    if (Object.keys(f).length > 0) setShowFilters(true);
    return f;
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  }

  const fetchTransactions = useCallback(
    () =>
      getTransactions({
        page,
        size: 10,
        sourceSystemId: filters.source || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        validationStatus: filters.validation || undefined,
        reconciliationStatus: filters.reconciliation || undefined,
      }),
    [page, filters],
  );

  const { data, loading, error, execute } =
    useApi<PaginatedData<Transaction>>(fetchTransactions);

  useEffect(() => {
    execute();
  }, [execute]);

  function handleFilterChange(newFilters: FilterValues) {
    setFilters(newFilters);
    setPage(1);
  }

  function handleRowClick(tx: Transaction) {
    router.push(`/transactions/${tx.id}`);
  }

  return (
    <div className="flex flex-col gap-5 h-full page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2>Transactions</h2>
        <div className="flex items-center gap-2">
          <FilterToggleButton
            activeCount={activeFilterCount}
            onClick={() => setShowFilters(!showFilters)}
          />
          <Button
            variant="outline"
            onClick={() => {
              toast.success("Export started", {
                description: `Exporting ${data?.totalItems ?? 0} transactions as CSV...`,
              });
            }}
          >
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filterOptions={FILTER_OPTIONS}
        filters={filters}
        onChange={handleFilterChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={COLUMNS}
        data={data?.items ?? []}
        keyExtractor={(tx) => tx.id}
        loading={loading}
        onRowClick={handleRowClick}
        sortColumn={sortCol}
        sortDirection={sortDir}
        onSort={handleSort}
        pagination={
          data
            ? {
                page: data.page,
                size: data.size,
                totalItems: data.totalItems,
                totalPages: data.totalPages,
              }
            : undefined
        }
        onPageChange={setPage}
        emptyMessage="No transactions found"
      />
    </div>
  );
}
