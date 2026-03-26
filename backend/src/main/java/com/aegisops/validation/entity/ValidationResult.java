package com.aegisops.validation.entity;

import com.aegisops.common.entity.BaseEntity;
import com.aegisops.common.enums.ValidationSeverity;
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

import java.util.Map;
import java.util.UUID;

/**
 * Stores one validation-rule result per transaction.
 * Multiple results per transaction are allowed (one per rule).
 * Maps to validation_results table — DB Design Section 5.8.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "validation_results")
public class ValidationResult extends BaseEntity {

    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @Column(name = "rule_code", nullable = false, length = 100)
    private String ruleCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 50)
    private ValidationSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ValidationStatus status;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "field_name", length = 255)
    private String fieldName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details_json", columnDefinition = "jsonb")
    private Map<String, Object> detailsJson;
}

