package com.aegisops.reconciliation.entity;

import com.aegisops.common.entity.BaseEntity;
import com.aegisops.common.enums.ReconciliationStatus;
import com.aegisops.common.enums.ReviewStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Stores one reconciliation result per transaction (per run).
 * Maps to reconciliation_results table — DB Design Section 5.10.
 * <p>
 * Tracks whether a transaction was MATCHED, MISMATCHED, MISSING, or NEEDS_REVIEW
 * against a reference transaction.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "reconciliation_results")
public class ReconciliationResult extends BaseEntity {

    @Column(name = "reconciliation_run_id")
    private UUID reconciliationRunId;

    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @Column(name = "matched_transaction_id")
    private UUID matchedTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "result_status", nullable = false, length = 50)
    private ReconciliationStatus resultStatus;

    @Column(name = "mismatch_reason", columnDefinition = "TEXT")
    private String mismatchReason;

    @Column(name = "amount_difference", precision = 19, scale = 4)
    private BigDecimal amountDifference;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", length = 50)
    private ReviewStatus reviewStatus;

    @Column(name = "review_comment", columnDefinition = "TEXT")
    private String reviewComment;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
