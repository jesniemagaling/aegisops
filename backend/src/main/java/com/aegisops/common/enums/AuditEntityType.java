package com.aegisops.common.enums;

/**
 * Audit entity types — used in audit_logs.entity_type column.
 * Prevents typos and enables analytics/filtering on structured values.
 */
public enum AuditEntityType {
    USER,
    TRANSACTION,
    SOURCE_SYSTEM
}

