"use client";

import { useState, useCallback } from "react";
import { ApiClientError } from "@/lib/api";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: () => Promise<void>;
}

/**
 * Reusable hook for async API calls.
 * Accepts a zero-argument function — bind arguments at the call site via closure.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(() => getUsers(page, size));
 */
export function useApi<T>(fn: () => Promise<T>): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "An unexpected error occurred";
      setState({ data: null, loading: false, error: message });
    }
  }, [fn]);

  return { ...state, execute };
}
