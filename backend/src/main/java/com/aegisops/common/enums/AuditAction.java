package com.aegisops.common.enums;

/**
 * Audit action types — used in audit_logs.action column.
 * Prevents typos and enables analytics/filtering on structured values.
 */
public enum AuditAction {
    CREATE,
    UPDATE,
    DELETE,
    LOGIN,
    VALIDATE,
    RECONCILE,
    UPDATE_ROLES
}

