package com.aegisops.transactions.controller;
import com.aegisops.common.dto.ApiResponse;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.ReconciliationStatus;
import com.aegisops.common.enums.RoleCode;
import com.aegisops.common.enums.ValidationStatus;
import com.aegisops.transactions.dto.request.IngestTransactionRequest;
import com.aegisops.transactions.dto.response.TransactionResponse;
import com.aegisops.transactions.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Transaction endpoints per API.md Section 6.4.
 *
 * POST /transactions/ingest  — ingest a single transaction (ADMIN, ANALYST)
 * GET  /transactions         — list transactions with filters (ADMIN, ANALYST, AUDITOR)
 * GET  /transactions/{id}    — get transaction by ID (ADMIN, ANALYST, AUDITOR)
 */
@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST)
    @PostMapping("/ingest")
    public ResponseEntity<ApiResponse<TransactionResponse>> ingest(
            @Valid @RequestBody IngestTransactionRequest request) {
        TransactionResponse response = transactionService.ingest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Transaction ingested"));
    }

    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST_AUDITOR)
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) UUID sourceSystemId,
            @RequestParam(required = false) Instant dateFrom,
            @RequestParam(required = false) Instant dateTo,
            @RequestParam(required = false) LocalDate businessDate,
            @RequestParam(required = false) ValidationStatus validationStatus,
            @RequestParam(required = false) ReconciliationStatus reconciliationStatus) {
        PagedResponse<TransactionResponse> response = transactionService.getTransactions(
                page, size, sourceSystemId, dateFrom, dateTo, businessDate,
                validationStatus, reconciliationStatus);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST_AUDITOR)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(
            @PathVariable UUID id) {
        TransactionResponse response = transactionService.getTransactionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}