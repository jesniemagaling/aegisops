package com.aegisops.transactions.service;
import com.aegisops.audit.service.AuditService;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import com.aegisops.common.enums.ReconciliationStatus;
import com.aegisops.common.enums.TransactionLifecycle;
import com.aegisops.common.enums.ValidationStatus;
import com.aegisops.common.exception.BusinessException;
import com.aegisops.common.exception.ErrorCode;
import com.aegisops.common.exception.ResourceNotFoundException;
import com.aegisops.reconciliation.service.ReconciliationService;
import com.aegisops.sourcesystems.entity.SourceSystem;
import com.aegisops.sourcesystems.repository.SourceSystemRepository;
import com.aegisops.transactions.dto.request.IngestTransactionRequest;
import com.aegisops.transactions.dto.response.TransactionResponse;
import com.aegisops.transactions.entity.Transaction;
import com.aegisops.transactions.repository.TransactionRepository;
import com.aegisops.transactions.repository.TransactionSpecification;
import com.aegisops.validation.service.ValidationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
/**
 * Transaction service — ingestion-ready per FRD Section 5.1.
 * Resolves source system by UUID or slug, sets lifecycle = INGESTED, persists,
 * then triggers validation (FRD Section 4.6) and reconciliation (FRD Section 4.8).
 */
@Slf4j
@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final SourceSystemRepository sourceSystemRepository;
    private final ValidationService validationService;
    private final ReconciliationService reconciliationService;
    private final AuditService auditService;
    public TransactionService(TransactionRepository transactionRepository,
                              SourceSystemRepository sourceSystemRepository,
                              ValidationService validationService,
                              ReconciliationService reconciliationService,
                              AuditService auditService) {
        this.transactionRepository = transactionRepository;
        this.sourceSystemRepository = sourceSystemRepository;
        this.validationService = validationService;
        this.reconciliationService = reconciliationService;
        this.auditService = auditService;
    }
    @Transactional
    public TransactionResponse ingest(IngestTransactionRequest request) {
        SourceSystem source = resolveSourceSystem(request.getSourceSystemId(), request.getSlug());
        Transaction tx = new Transaction();
        tx.setSourceSystemId(source.getId());
        tx.setExternalTransactionId(request.getExternalId());
        tx.setAmountIn(request.getAmount());
        tx.setCurrency(request.getCurrency().toUpperCase().strip());
        tx.setOccurredAt(request.getTransactionDate());
        tx.setLifecycleStatus(TransactionLifecycle.INGESTED);
        Transaction saved = transactionRepository.save(tx);
        log.info("Transaction ingested [id={}, source={}]", saved.getId(), source.getSlug());

        auditService.logAction(AuditEntityType.TRANSACTION, saved.getId(), AuditAction.CREATE,
                java.util.Map.of(
                        "message", "Transaction ingested",
                        "source", source.getSlug(),
                        "externalId", String.valueOf(saved.getExternalTransactionId())
                ));

        // Trigger validation after ingestion — FRD Section 4.6 / 5.1
        validationService.validateTransaction(saved);

        // Trigger reconciliation after validation — FRD Section 4.8 / 5.2
        reconciliationService.reconcileTransaction(saved);

        return toResponse(saved);
    }

    /**
     * Retrieve paginated transactions with optional filters per API.md §6.4.
     */
    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getTransactions(int page, int size,
                                                               UUID sourceSystemId,
                                                               Instant dateFrom,
                                                               Instant dateTo,
                                                               LocalDate businessDate,
                                                               ValidationStatus validationStatus,
                                                               ReconciliationStatus reconciliationStatus) {
        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size, Sort.by("createdAt").descending());
        Page<Transaction> txPage = transactionRepository.findAll(
                TransactionSpecification.withFilters(sourceSystemId, dateFrom, dateTo,
                        businessDate, validationStatus, reconciliationStatus),
                pageable);
        return PagedResponse.<TransactionResponse>builder()
                .page(txPage.getNumber() + 1)
                .size(txPage.getSize())
                .totalItems(txPage.getTotalElements())
                .totalPages(txPage.getTotalPages())
                .items(txPage.getContent().stream().map(this::toResponse).toList())
                .build();
    }

    /**
     * Retrieve a single transaction by ID per API.md §6.4.
     */
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(UUID id) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id.toString()));
        return toResponse(tx);
    }

    private SourceSystem resolveSourceSystem(UUID id, String slug) {
        if (id != null) {
            return sourceSystemRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("SourceSystem", id.toString()));
        }
        if (slug != null && !slug.isBlank()) {
            return sourceSystemRepository.findBySlug(slug.toLowerCase().strip())
                    .orElseThrow(() -> new ResourceNotFoundException("SourceSystem", slug));
        }
        throw new BusinessException(ErrorCode.ERR_VALIDATION,
                "Either sourceSystemId or slug must be provided");
    }
    private TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .sourceSystemId(tx.getSourceSystemId())
                .externalTransactionId(tx.getExternalTransactionId())
                .referenceId(tx.getReferenceId())
                .transactionType(tx.getTransactionType())
                .amountIn(tx.getAmountIn())
                .amountOut(tx.getAmountOut())
                .currency(tx.getCurrency())
                .occurredAt(tx.getOccurredAt())
                .businessDate(tx.getBusinessDate())
                .lifecycleStatus(tx.getLifecycleStatus())
                .validationStatus(tx.getValidationStatus())
                .reconciliationStatus(tx.getReconciliationStatus())
                .reviewStatus(tx.getReviewStatus())
                .createdAt(tx.getCreatedAt())
                .updatedAt(tx.getUpdatedAt())
                .build();
    }
}