package com.aegisops.reconciliation.entity;

import com.aegisops.common.enums.ReconciliationRunStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "reconciliation_runs")
public class ReconciliationRun {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    @Column(name = "source_a_id", nullable = false) private UUID sourceAId;
    @Column(name = "source_b_id", nullable = false) private UUID sourceBId;
    @Column(name = "date_from", nullable = false) private LocalDate dateFrom;
    @Column(name = "date_to", nullable = false) private LocalDate dateTo;
    @Column(name = "matching_strategy", length = 100) private String matchingStrategy;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50) private ReconciliationRunStatus status;
    @Column(name = "requested_by") private UUID requestedBy;
    @Column(name = "started_at") private Instant startedAt;
    @Column(name = "completed_at") private Instant completedAt;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "summary_json", columnDefinition = "jsonb")
    private Map<String, Object> summaryJson;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @PrePersist protected void onCreate() { this.createdAt = Instant.now(); }
}
