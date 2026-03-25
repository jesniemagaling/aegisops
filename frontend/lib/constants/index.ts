if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  USERS: "/users",
  ROLES: "/roles",
  SOURCE_SYSTEMS: "/source-systems",
  INGESTION_BATCHES: "/ingestion/batches",
  INGESTION_UPLOAD: "/ingestion/upload",
  INGESTION_PUSH: "/ingestion/push",
  TRANSACTIONS: "/transactions",
  VALIDATION_RESULTS: "/validation/results",
  VALIDATION_RULES: "/validation/rules",
  RECONCILIATION_RUNS: "/reconciliation/runs",
  RECONCILIATION_RESULTS: "/reconciliation/results",
  ALERTS: "/alerts",
  AI_QUERY: "/ai/copilot/query",
  AI_QUERIES: "/ai/queries",
  AI_INSIGHTS: "/ai/insights",
  JOBS: "/jobs",
  AUDIT_LOGS: "/audit/logs",
  AUTH_LOGIN: "/auth/login",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_ME: "/auth/me",
} as const;
