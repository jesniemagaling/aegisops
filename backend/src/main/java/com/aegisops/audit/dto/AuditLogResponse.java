package com.aegisops.audit.dto;

import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Response DTO for audit log entries — hides entity from API layer.
 * Ready for use when the audit controller is introduced (API.md §6.10).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private UUID id;
    private UUID userId;
    private AuditAction action;
    private AuditEntityType entityType;
    private UUID entityId;
    private Map<String, Object> detailsJson;
    private Instant createdAt;
}
