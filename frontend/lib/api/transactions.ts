import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { PaginatedData, Transaction } from "@/types";

interface TransactionFilters {
  page?: number;
  size?: number;
  sourceSystemId?: string;
  dateFrom?: string;
  dateTo?: string;
  businessDate?: string;
  validationStatus?: string;
  reconciliationStatus?: string;
}

export function getTransactions(
  filters: TransactionFilters = {},
): Promise<PaginatedData<Transaction>> {
  const params = new URLSearchParams();
  const { page = 1, size = 25, ...rest } = filters;
  params.set("page", String(page));
  params.set("size", String(size));

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }

  return apiClient<PaginatedData<Transaction>>(
    `${API_ENDPOINTS.TRANSACTIONS}?${params.toString()}`,
  );
}

export function getTransaction(id: string): Promise<Transaction> {
  return apiClient<Transaction>(`${API_ENDPOINTS.TRANSACTIONS}/${id}`);
}
