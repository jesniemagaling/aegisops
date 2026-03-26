package com.aegisops.transactions.entity;
import com.aegisops.common.entity.BaseEntity;
import com.aegisops.common.enums.ReconciliationStatus;
import com.aegisops.common.enums.ReviewStatus;
import com.aegisops.common.enums.TransactionLifecycle;
import com.aegisops.common.enums.ValidationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
/**
 * Canonical transaction entity per DB.md Section 5.7.
 * Maps every column in the transactions table.
 * Lifecycle fields use strict enums from common.enums.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "transactions")
public class Transaction extends BaseEntity {
    @Column(name = "source_system_id", nullable = false)
    private UUID sourceSystemId;
    @Column(name = "ingestion_batch_id")
    private UUID ingestionBatchId;
    @Column(name = "raw_transaction_id")
    private UUID rawTransactionId;
    @Column(name = "external_transaction_id", length = 255)
    private String externalTransactionId;
    @Column(name = "reference_id", length = 255)
    private String referenceId;
    @Column(name = "transaction_type", length = 100)
    private String transactionType;
    @Column(name = "amount_in", precision = 19, scale = 4)
    private BigDecimal amountIn;
    @Column(name = "amount_out", precision = 19, scale = 4)
    private BigDecimal amountOut;
    @Column(name = "currency", length = 10)
    private String currency;
    @Column(name = "occurred_at")
    private Instant occurredAt;
    @Column(name = "business_date")
    private LocalDate businessDate;
    @Enumerated(EnumType.STRING)
    @Column(name = "lifecycle_status", nullable = false, length = 50)
    private TransactionLifecycle lifecycleStatus;
    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status", length = 50)
    private ValidationStatus validationStatus;
    @Enumerated(EnumType.STRING)
    @Column(name = "reconciliation_status", length = 50)
    private ReconciliationStatus reconciliationStatus;
    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", length = 50)
    private ReviewStatus reviewStatus;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private Map<String, Object> metadataJson;
}