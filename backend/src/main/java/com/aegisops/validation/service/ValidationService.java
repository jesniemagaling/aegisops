package com.aegisops.validation.service;

import com.aegisops.audit.service.AuditService;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import com.aegisops.common.enums.TransactionLifecycle;
import com.aegisops.common.enums.ValidationSeverity;
import com.aegisops.common.enums.ValidationStatus;
import com.aegisops.transactions.entity.Transaction;
import com.aegisops.transactions.repository.TransactionRepository;
import com.aegisops.validation.entity.ValidationResult;
import com.aegisops.validation.repository.ValidationResultRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Validation engine — FRD Section 4.6.
 * <p>
 * Runs field-level and business-rule validations against a canonical transaction,
 * persists individual rule results, aggregates to a single validation status,
 * and advances the transaction lifecycle to VALIDATED.
 */
@Slf4j
@Service
public class ValidationService {

    private static final BigDecimal AMOUNT_THRESHOLD = new BigDecimal("1000000");

    private final ValidationResultRepository validationResultRepository;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;

    public ValidationService(ValidationResultRepository validationResultRepository,
                             TransactionRepository transactionRepository,
                             AuditService auditService) {
        this.validationResultRepository = validationResultRepository;
        this.transactionRepository = transactionRepository;
        this.auditService = auditService;
    }

    // ------------------------------------------------------------------
    // Public entry point
    // ------------------------------------------------------------------

    /**
     * Validate a transaction: run all rules, persist results, update transaction.
     */
    @Transactional
    public List<ValidationResult> validateTransaction(Transaction transaction) {
        UUID txId = transaction.getId();
        log.info("Starting validation for transaction [id={}]", txId);

        List<ValidationResult> results = new ArrayList<>();

        // --- A. Field validation ---
        validateFieldNotNull(results, txId, transaction.getExternalTransactionId(),
                "externalTransactionId", "FIELD_EXTERNAL_ID_REQUIRED",
                "External transaction ID must not be null");

        validateFieldNotNull(results, txId, transaction.getCurrency(),
                "currency", "FIELD_CURRENCY_REQUIRED",
                "Currency must not be null");

        validateFieldNotNull(results, txId, transaction.getOccurredAt(),
                "occurredAt", "FIELD_TRANSACTION_DATE_REQUIRED",
                "Transaction date must not be null");

        validateAmountPositive(results, txId, transaction.getAmountIn());

        // --- B. Business-rule validation ---
        validateAmountThreshold(results, txId, transaction.getAmountIn());
        validateDateNotInFuture(results, txId, transaction.getOccurredAt());

        // --- C. Persist all results ---
        List<ValidationResult> saved = validationResultRepository.saveAll(results);

        // --- D. Aggregate status ---
        ValidationStatus aggregated = aggregateStatus(saved);
        transaction.setValidationStatus(aggregated);

        // --- E. Lifecycle update ---
        transaction.setLifecycleStatus(TransactionLifecycle.VALIDATED);

        // --- F. Save transaction ---
        transactionRepository.save(transaction);

        log.info("Validation complete for transaction [id={}, status={}]", txId, aggregated);

        auditService.logAction(AuditEntityType.TRANSACTION, txId, AuditAction.VALIDATE,
                java.util.Map.of(
                        "message", "Validation completed",
                        "status", aggregated.name(),
                        "ruleResults", saved.size()
                ));

        return saved;
    }

    // ------------------------------------------------------------------
    // Field-level rules
    // ------------------------------------------------------------------

    private void validateFieldNotNull(List<ValidationResult> results, UUID txId,
                                      Object value, String fieldName,
                                      String ruleCode, String message) {
        if (value == null || (value instanceof String s && s.isBlank())) {
            results.add(buildResult(txId, ruleCode, ValidationSeverity.ERROR,
                    ValidationStatus.INVALID, message, fieldName));
        }
    }

    private void validateAmountPositive(List<ValidationResult> results, UUID txId,
                                        BigDecimal amount) {
        if (amount == null) {
            results.add(buildResult(txId, "FIELD_AMOUNT_REQUIRED",
                    ValidationSeverity.ERROR, ValidationStatus.INVALID,
                    "Amount must not be null", "amountIn"));
            return;
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            results.add(buildResult(txId, "FIELD_AMOUNT_POSITIVE",
                    ValidationSeverity.ERROR, ValidationStatus.INVALID,
                    "Amount must be greater than zero", "amountIn"));
        }
    }

    // ------------------------------------------------------------------
    // Business rules
    // ------------------------------------------------------------------

    private void validateAmountThreshold(List<ValidationResult> results, UUID txId,
                                         BigDecimal amount) {
        if (amount != null && amount.compareTo(AMOUNT_THRESHOLD) > 0) {
            results.add(buildResult(txId, "BIZ_AMOUNT_EXCEEDS_THRESHOLD",
                    ValidationSeverity.WARNING, ValidationStatus.WARNING,
                    "Amount exceeds threshold of " + AMOUNT_THRESHOLD, "amountIn"));
        }
    }

    private void validateDateNotInFuture(List<ValidationResult> results, UUID txId,
                                         Instant occurredAt) {
        if (occurredAt != null && occurredAt.isAfter(Instant.now())) {
            results.add(buildResult(txId, "BIZ_DATE_IN_FUTURE",
                    ValidationSeverity.WARNING, ValidationStatus.WARNING,
                    "Transaction date is in the future", "occurredAt"));
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ValidationResult buildResult(UUID transactionId, String ruleCode,
                                         ValidationSeverity severity,
                                         ValidationStatus status,
                                         String message, String fieldName) {
        ValidationResult result = new ValidationResult();
        result.setTransactionId(transactionId);
        result.setRuleCode(ruleCode);
        result.setSeverity(severity);
        result.setStatus(status);
        result.setMessage(message);
        result.setFieldName(fieldName);
        return result;
    }

    /**
     * Aggregate individual rule results into a single transaction-level status.
     * If ANY result is ERROR → INVALID; else if ANY WARNING → WARNING; else VALID.
     */
    private ValidationStatus aggregateStatus(List<ValidationResult> results) {
        boolean hasError = results.stream()
                .anyMatch(r -> r.getSeverity() == ValidationSeverity.ERROR);
        if (hasError) {
            return ValidationStatus.INVALID;
        }

        boolean hasWarning = results.stream()
                .anyMatch(r -> r.getSeverity() == ValidationSeverity.WARNING);
        if (hasWarning) {
            return ValidationStatus.WARNING;
        }

        return ValidationStatus.VALID;
    }
}

