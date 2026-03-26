package com.aegisops.common.enums;

/**
 * Role codes matching seeded roles in DB (V1__initial_schema.sql).
 * Used for @PreAuthorize SpEL expressions and SecurityUtils.
 */
public final class RoleCode {

    private RoleCode() {
        // constants class — no instantiation
    }

    public static final String ADMIN   = "ADMIN";
    public static final String ANALYST = "ANALYST";
    public static final String AUDITOR = "AUDITOR";
    public static final String VIEWER  = "VIEWER";

    // SpEL-ready authority strings for @PreAuthorize
    public static final String HAS_ADMIN           = "hasRole('ADMIN')";
    public static final String HAS_ADMIN_ANALYST   = "hasAnyRole('ADMIN', 'ANALYST')";
    public static final String HAS_ADMIN_ANALYST_AUDITOR = "hasAnyRole('ADMIN', 'ANALYST', 'AUDITOR')";
    public static final String HAS_ANY_ROLE        = "hasAnyRole('ADMIN', 'ANALYST', 'AUDITOR', 'VIEWER')";
}

