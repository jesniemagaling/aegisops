package com.aegisops.audit.controller;

import com.aegisops.audit.dto.AuditLogResponse;
import com.aegisops.audit.service.AuditService;
import com.aegisops.common.dto.ApiResponse;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import com.aegisops.common.enums.RoleCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Audit log endpoints per API.md §6.10.
 *
 * GET /audit/logs — list audit logs (ADMIN, AUDITOR)
 */
@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST_AUDITOR)
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) AuditEntityType entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) UUID userId) {
        PagedResponse<AuditLogResponse> response = auditService.getAuditLogs(
                page, size, entityType, entityId, action, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
