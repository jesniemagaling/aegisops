package com.aegisops.common.exception;

import com.aegisops.common.config.RequestIdFilter;
import com.aegisops.common.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Global exception handler per API.md §4.2.
 * Every error response includes: code, message, requestId, details.
 * requestId is sourced from MDC (set by {@link RequestIdFilter}).
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.builder()
                .code(ErrorCode.ERR_NOT_FOUND.getCode())
                .message(ex.getMessage())
                .requestId(getRequestId())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        log.warn("Business exception [{}]: {}", ex.getErrorCode().getCode(), ex.getMessage());
        HttpStatus status = mapErrorCodeToStatus(ex.getErrorCode());
        ErrorResponse error = ErrorResponse.builder()
                .code(ex.getErrorCode().getCode())
                .message(ex.getMessage())
                .requestId(getRequestId())
                .build();
        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        log.warn("Unauthorized: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.builder()
                .code(ErrorCode.ERR_UNAUTHORIZED.getCode())
                .message(ex.getMessage())
                .requestId(getRequestId())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
        log.warn("Forbidden: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.builder()
                .code(ErrorCode.ERR_FORBIDDEN.getCode())
                .message(ex.getMessage())
                .requestId(getRequestId())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Handles Spring Security's AccessDeniedException thrown by @PreAuthorize.
     * Returns 403 with standard error body.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.builder()
                .code(ErrorCode.ERR_FORBIDDEN.getCode())
                .message("Access denied — insufficient permissions")
                .requestId(getRequestId())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        log.warn("Validation failed with {} error(s)", ex.getBindingResult().getErrorCount());
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> ErrorResponse.FieldError.builder()
                        .field(fe.getField())
                        .message(fe.getDefaultMessage())
                        .rejectedValue(fe.getRejectedValue())
                        .build())
                .toList();

        ErrorResponse error = ErrorResponse.builder()
                .code(ErrorCode.ERR_VALIDATION.getCode())
                .message("Validation failed")
                .requestId(getRequestId())
                .details(fieldErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.builder()
                .code(ErrorCode.ERR_VALIDATION.getCode())
                .message(ex.getMessage())
                .requestId(getRequestId())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorResponse error = ErrorResponse.builder()
                .code(ErrorCode.ERR_INTERNAL.getCode())
                .message("An unexpected error occurred")
                .requestId(getRequestId())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String getRequestId() {
        return MDC.get(RequestIdFilter.REQUEST_ID_KEY);
    }

    private HttpStatus mapErrorCodeToStatus(ErrorCode errorCode) {
        return switch (errorCode) {
            case ERR_VALIDATION -> HttpStatus.BAD_REQUEST;
            case ERR_UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
            case ERR_FORBIDDEN -> HttpStatus.FORBIDDEN;
            case ERR_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case ERR_INTERNAL -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}

