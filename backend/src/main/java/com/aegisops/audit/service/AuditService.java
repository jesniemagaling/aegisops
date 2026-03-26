package com.aegisops.audit.service;

import com.aegisops.audit.dto.AuditLogResponse;
import com.aegisops.audit.entity.AuditLog;
import com.aegisops.audit.repository.AuditLogRepository;
import com.aegisops.common.config.SecurityUtils;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Cross-cutting audit logging service — FRD Section 4.11.
 * <p>
 * Design decisions:
 * <ul>
 *   <li>Never throws — audit failures must not break business logic.</li>
 *   <li>Uses REQUIRES_NEW propagation so audit persists even if the caller rolls back.</li>
 *   <li>Captures current userId from SecurityContext (nullable for system/anonymous actions).</li>
 *   <li>Embeds requestId from MDC into details_json for traceability.</li>
 *   <li>Sensitive data (passwords, tokens) must NEVER be passed in the details parameter.</li>
 *   <li>Uses strict enums for action and entityType — no raw strings.</li>
 *   <li>Structured JSON details enable querying, analytics, and future dashboards.</li>
 * </ul>
 */
@Slf4j
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    /**
     * Record an audit event with structured details.
     *
     * @param entityType domain entity type (enum)
     * @param entityId   primary key of the affected entity (nullable for bulk ops)
     * @param action     action performed (enum)
     * @param details    structured key-value pairs describing the change (must NOT contain secrets)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditEntityType entityType, UUID entityId,
                          AuditAction action, Map<String, Object> details) {
        try {
            AuditLog entry = new AuditLog();
            entry.setUserId(resolveUserId());
            entry.setAction(action);
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setDetailsJson(enrichDetails(details));

            auditLogRepository.save(entry);

            log.debug("Audit logged [entity={}, id={}, action={}]", entityType, entityId, action);
        } catch (Exception ex) {
            // Audit must never break the caller's flow
            log.error("Failed to persist audit log [entity={}, id={}, action={}]: {}",
                    entityType, entityId, action, ex.getMessage(), ex);
        }
    }

    /**
     * Convenience overload: record an audit event with a simple message.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditEntityType entityType, UUID entityId,
                          AuditAction action, String message) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("message", message);
        logAction(entityType, entityId, action, details);
    }

    /**
     * Convenience overload for actions with no specific entity (e.g. bulk operations).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditEntityType entityType, AuditAction action, String message) {
        logAction(entityType, null, action, message);
    }

    // ------------------------------------------------------------------
    // Read API — for AuditController (GET /audit/logs)
    // ------------------------------------------------------------------

    /**
     * Retrieve paginated audit logs with optional filters per API.md §6.10.
     */
    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getAuditLogs(int page, int size,
                                                         AuditEntityType entityType,
                                                         UUID entityId,
                                                         AuditAction action,
                                                         UUID userId) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size,
                Sort.by("createdAt").descending());

        Page<AuditLog> logPage;
        if (entityType != null && entityId != null) {
            logPage = auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable);
        } else if (entityType != null) {
            logPage = auditLogRepository.findByEntityType(entityType, pageable);
        } else if (action != null) {
            logPage = auditLogRepository.findByAction(action, pageable);
        } else if (userId != null) {
            logPage = auditLogRepository.findByUserId(userId, pageable);
        } else {
            logPage = auditLogRepository.findAll(pageable);
        }

        return PagedResponse.<AuditLogResponse>builder()
                .page(logPage.getNumber() + 1)
                .size(logPage.getSize())
                .totalItems(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .items(logPage.getContent().stream().map(this::toResponse).toList())
                .build();
    }

    private AuditLogResponse toResponse(AuditLog entry) {
        return AuditLogResponse.builder()
                .id(entry.getId())
                .userId(entry.getUserId())
                .action(entry.getAction())
                .entityType(entry.getEntityType())
                .entityId(entry.getEntityId())
                .detailsJson(entry.getDetailsJson())
                .createdAt(entry.getCreatedAt())
                .build();
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    /**
     * Resolve current user from SecurityContext. Returns null for system/anonymous actions.
     */
    private UUID resolveUserId() {
        return SecurityUtils.getCurrentUserId().orElse(null);
    }

    /**
     * Enrich the caller-provided details map with request context from MDC.
     * Returns a new map (does not mutate the input).
     */
    private Map<String, Object> enrichDetails(Map<String, Object> callerDetails) {
        Map<String, Object> json = new LinkedHashMap<>();
        if (callerDetails != null) {
            json.putAll(callerDetails);
        }

        String requestId = MDC.get("requestId");
        if (requestId != null) {
            json.put("requestId", requestId);
        }

        String method = MDC.get("method");
        String path = MDC.get("path");
        if (method != null && path != null) {
            json.put("httpMethod", method);
            json.put("httpPath", path);
        }

        return json;
    }
}
