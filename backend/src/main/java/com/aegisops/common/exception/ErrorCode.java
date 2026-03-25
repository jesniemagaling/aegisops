package com.aegisops.common.exception;

/**
 * Standard error codes per API.md §10.
 */
public enum ErrorCode {

    ERR_VALIDATION("ERR_VALIDATION", "Validation failed"),
    ERR_UNAUTHORIZED("ERR_UNAUTHORIZED", "Unauthorized access"),
    ERR_FORBIDDEN("ERR_FORBIDDEN", "Access denied"),
    ERR_NOT_FOUND("ERR_NOT_FOUND", "Resource not found"),
    ERR_INTERNAL("ERR_INTERNAL", "Internal server error");

    private final String code;
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}

