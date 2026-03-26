"use client";

import { useEffect, useCallback, useState } from "react";
import { getTransactions } from "@/lib/api";
import { useApi } from "@/hooks";
import type { PaginatedData, Transaction } from "@/types";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [sourceSystemId, setSourceSystemId] = useState("");
  const [validationStatus, setValidationStatus] = useState("");

  const fetchTransactions = useCallback(
    () => getTransactions({ page, size: 25, sourceSystemId, validationStatus }),
    [page, sourceSystemId, validationStatus],
  );

  const { data, loading, error, execute } =
    useApi<PaginatedData<Transaction>>(fetchTransactions);

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Transactions</h1>
      <div>
        <input
          placeholder="Source System ID"
          value={sourceSystemId}
          onChange={(e) => {
            setSourceSystemId(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={validationStatus}
          onChange={(e) => {
            setValidationStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="VALID">Valid</option>
          <option value="INVALID">Invalid</option>
          <option value="WARNING">Warning</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>External ID</th>
            <th>Type</th>
            <th>Amount In</th>
            <th>Amount Out</th>
            <th>Currency</th>
            <th>Validation</th>
            <th>Reconciliation</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.externalTransactionId}</td>
              <td>{tx.transactionType}</td>
              <td>{tx.amountIn}</td>
              <td>{tx.amountOut}</td>
              <td>{tx.currency}</td>
              <td>{tx.validationStatus}</td>
              <td>{tx.reconciliationStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && (
        <div>
          <span>
            Page {data.page} of {data.totalPages} ({data.totalItems} total)
          </span>
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={data.page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
