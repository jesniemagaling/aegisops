import { API_BASE_URL } from "@/lib/constants";
import { authStore } from "@/lib/auth";
import type { ApiError, ApiResponse } from "@/types";

export class ApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly details: string[];

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.requestId = error.requestId;
    this.details = error.details;
  }
}

/**
 * Centralized API client.
 * Automatically unwraps ApiResponse<T> and returns the `data` field.
 * Throws ApiClientError on non-OK responses or unsuccessful responses.
 */
export async function apiClient<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const token = authStore.getToken();
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    authStore.clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiClientError({
      code: "ERR_UNAUTHORIZED",
      message: "Session expired. Redirecting to login.",
      requestId: "",
      details: [],
    });
  }

  const body: ApiResponse<T> | ApiError = await response.json().catch(() => {
    throw new ApiClientError({
      code: "ERR_PARSE",
      message: `Failed to parse response (HTTP ${response.status})`,
      requestId: "",
      details: [],
    });
  });

  if (!response.ok) {
    const err = body as ApiError;
    throw new ApiClientError({
      code: err.code ?? "ERR_INTERNAL",
      message: err.message ?? `Request failed with status ${response.status}`,
      requestId: err.requestId ?? "",
      details: err.details ?? [],
    });
  }

  const success = body as ApiResponse<T>;

  if (!success.success) {
    throw new ApiClientError({
      code: "ERR_INTERNAL",
      message: success.message ?? "Request was not successful",
      requestId: success.requestId ?? "",
      details: [],
    });
  }

  return success.data;
}
