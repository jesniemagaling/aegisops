package com.aegisops.audit.repository;

import com.aegisops.audit.entity.AuditLog;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByEntityTypeAndEntityId(AuditEntityType entityType, UUID entityId, Pageable pageable);

    Page<AuditLog> findByUserId(UUID userId, Pageable pageable);

    Page<AuditLog> findByEntityType(AuditEntityType entityType, Pageable pageable);

    Page<AuditLog> findByAction(AuditAction action, Pageable pageable);
}


