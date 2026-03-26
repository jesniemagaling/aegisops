package com.aegisops.reconciliation.service;

import com.aegisops.audit.service.AuditService;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import com.aegisops.common.enums.ReconciliationStatus;
import com.aegisops.common.enums.TransactionLifecycle;
import com.aegisops.common.enums.ValidationStatus;
import com.aegisops.reconciliation.entity.ReconciliationResult;
import com.aegisops.reconciliation.repository.ReconciliationResultRepository;
import com.aegisops.transactions.entity.Transaction;
import com.aegisops.transactions.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Reconciliation engine — FRD Section 4.8 / System Design Section 5.2.
 * <p>
 * Compares a canonical transaction against reference transactions to detect
 * matches, mismatches, and missing records. Persists a {@link ReconciliationResult},
 * updates the transaction's reconciliation status, and advances the lifecycle
 * to RECONCILED.
 * <p>
 * Hardening rules:
 * <ul>
 *   <li>Pre-check: INVALID transactions are skipped.</li>
 *   <li>Duplicate protection: previous results are deleted before saving.</li>
 *   <li>Self-matching exclusion: the transaction's own ID is always excluded.</li>
 *   <li>Multiple matches: if more than one reference found → NEEDS_REVIEW.</li>
 *   <li>Currency mismatch: different currencies → MISMATCHED.</li>
 *   <li>Null-safe: all amount/currency comparisons are null-guarded.</li>
 *   <li>Structured mismatch reasons for analytics.</li>
 * </ul>
 */
@Slf4j
@Service
public class ReconciliationService {

    /** Structured mismatch reason codes */
    private static final String REASON_MATCHED = "MATCHED";
    private static final String REASON_AMOUNT_MISMATCH = "AMOUNT_MISMATCH";
    private static final String REASON_CURRENCY_MISMATCH = "CURRENCY_MISMATCH";
    private static final String REASON_NOT_FOUND = "TRANSACTION_NOT_FOUND";
    private static final String REASON_MULTIPLE_MATCHES = "MULTIPLE_MATCHES";

    private final ReconciliationResultRepository reconciliationResultRepository;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;

    public ReconciliationService(ReconciliationResultRepository reconciliationResultRepository,
                                 TransactionRepository transactionRepository,
                                 AuditService auditService) {
        this.reconciliationResultRepository = reconciliationResultRepository;
        this.transactionRepository = transactionRepository;
        this.auditService = auditService;
    }

    // ------------------------------------------------------------------
    // Public entry point
    // ------------------------------------------------------------------

    /**
     * Reconcile a single transaction against reference data.
     * <ol>
     *   <li>Pre-check — skip INVALID transactions</li>
     *   <li>Delete previous results (duplicate protection)</li>
     *   <li>Find matching reference transaction(s)</li>
     *   <li>Determine reconciliation status</li>
     *   <li>Persist reconciliation result</li>
     *   <li>Update transaction reconciliation status and lifecycle</li>
     * </ol>
     *
     * @param transaction the canonical transaction to reconcile
     * @return the persisted ReconciliationResult, or {@code null} if skipped
     */
    @Transactional
    public ReconciliationResult reconcileTransaction(Transaction transaction) {
        UUID txId = transaction.getId();

        // --- A. Pre-check: skip INVALID transactions ---
        if (transaction.getValidationStatus() == ValidationStatus.INVALID) {
            log.info("Skipping reconciliation for INVALID transaction [id={}]", txId);
            return null;
        }

        log.info("Starting reconciliation for transaction [id={}]", txId);

        // --- B. Duplicate protection: remove previous results ---
        reconciliationResultRepository.deleteByTransactionId(txId);

        // --- C. Find matching reference transactions ---
        List<Transaction> references = findReferenceTransactions(transaction);

        // --- D. Determine status and build result ---
        ReconciliationResult result = buildReconciliationResult(transaction, references);

        // --- E. Persist reconciliation result ---
        ReconciliationResult saved = reconciliationResultRepository.save(result);

        // --- F. Update transaction reconciliation status ---
        transaction.setReconciliationStatus(saved.getResultStatus());

        // --- G. Lifecycle update ---
        transaction.setLifecycleStatus(TransactionLifecycle.RECONCILED);

        // --- H. Save transaction ---
        transactionRepository.save(transaction);

        log.info("Reconciliation complete for transaction [id={}, status={}, reason={}]",
                txId, saved.getResultStatus(), saved.getMismatchReason());

        // --- I. Audit ---
        Map<String, Object> auditDetails = new LinkedHashMap<>();
        auditDetails.put("message", "Reconciliation completed");
        auditDetails.put("status", saved.getResultStatus().name());
        auditDetails.put("reason", saved.getMismatchReason());
        if (saved.getAmountDifference() != null) {
            auditDetails.put("amountDifference", saved.getAmountDifference().toPlainString());
        }
        if (saved.getMatchedTransactionId() != null) {
            auditDetails.put("matchedTransactionId", saved.getMatchedTransactionId().toString());
        }
        auditDetails.put("candidatesFound", references.size());
        auditService.logAction(AuditEntityType.TRANSACTION, txId, AuditAction.RECONCILE, auditDetails);

        return saved;
    }

    // ------------------------------------------------------------------
    // Reference matching
    // ------------------------------------------------------------------

    /**
     * Find all reference transactions with the same externalTransactionId
     * and sourceSystemId but a different primary key.
     * Self-matching is always excluded via the {@code IdNot} clause.
     */
    private List<Transaction> findReferenceTransactions(Transaction transaction) {
        if (transaction.getExternalTransactionId() == null
                || transaction.getExternalTransactionId().isBlank()) {
            return List.of();
        }
        return transactionRepository.findAllByExternalTransactionIdAndSourceSystemIdAndIdNot(
                transaction.getExternalTransactionId(),
                transaction.getSourceSystemId(),
                transaction.getId()
        );
    }

    // ------------------------------------------------------------------
    // Result construction
    // ------------------------------------------------------------------

    /**
     * Build a {@link ReconciliationResult} based on reference matching outcome.
     * <ul>
     *   <li>No match → MISSING</li>
     *   <li>Multiple matches → NEEDS_REVIEW</li>
     *   <li>Currency differs → MISMATCHED</li>
     *   <li>Amount differs → MISMATCHED (with difference)</li>
     *   <li>Exact match → MATCHED</li>
     * </ul>
     */
    private ReconciliationResult buildReconciliationResult(Transaction transaction,
                                                           List<Transaction> references) {
        ReconciliationResult result = new ReconciliationResult();
        result.setTransactionId(transaction.getId());

        // --- No match found ---
        if (references.isEmpty()) {
            result.setResultStatus(ReconciliationStatus.MISSING);
            result.setMismatchReason(REASON_NOT_FOUND);
            return result;
        }

        // --- Multiple matches → NEEDS_REVIEW ---
        if (references.size() > 1) {
            result.setResultStatus(ReconciliationStatus.NEEDS_REVIEW);
            result.setMismatchReason(REASON_MULTIPLE_MATCHES);
            result.setMatchedTransactionId(references.get(0).getId());
            return result;
        }

        // --- Single match: detailed comparison ---
        Transaction reference = references.get(0);
        result.setMatchedTransactionId(reference.getId());

        // Currency check (null-safe)
        String txCurrency = normalizeCurrency(transaction.getCurrency());
        String refCurrency = normalizeCurrency(reference.getCurrency());
        if (!txCurrency.equals(refCurrency)) {
            result.setResultStatus(ReconciliationStatus.MISMATCHED);
            result.setMismatchReason(REASON_CURRENCY_MISMATCH);
            return result;
        }

        // Amount check (null-safe)
        BigDecimal txAmount = effectiveAmount(transaction);
        BigDecimal refAmount = effectiveAmount(reference);

        if (txAmount.compareTo(refAmount) == 0) {
            result.setResultStatus(ReconciliationStatus.MATCHED);
            result.setMismatchReason(REASON_MATCHED);
            result.setAmountDifference(BigDecimal.ZERO);
        } else {
            BigDecimal difference = txAmount.subtract(refAmount).abs();
            result.setResultStatus(ReconciliationStatus.MISMATCHED);
            result.setMismatchReason(REASON_AMOUNT_MISMATCH);
            result.setAmountDifference(difference);
        }

        return result;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * Return the effective amount for comparison.
     * Uses amountIn if present, otherwise amountOut, otherwise ZERO.
     */
    private BigDecimal effectiveAmount(Transaction tx) {
        if (tx.getAmountIn() != null) {
            return tx.getAmountIn();
        }
        if (tx.getAmountOut() != null) {
            return tx.getAmountOut();
        }
        return BigDecimal.ZERO;
    }

    /**
     * Normalize currency to uppercase, defaulting to empty string if null.
     */
    private String normalizeCurrency(String currency) {
        return (currency != null) ? currency.toUpperCase().strip() : "";
    }
}
