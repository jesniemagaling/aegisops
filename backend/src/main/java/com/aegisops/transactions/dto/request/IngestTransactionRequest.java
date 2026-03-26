package com.aegisops.transactions.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
/**
 * Ingest a single transaction.
 * Accepts either sourceSystemId (UUID) or slug (String) to resolve the source.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IngestTransactionRequest {
    /** Provide sourceSystemId OR slug — at least one is required */
    private UUID sourceSystemId;
    /** URL-safe slug alternative to sourceSystemId */
    private String slug;
    @NotBlank(message = "External ID is required")
    private String externalId;
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    @NotBlank(message = "Currency is required")
    private String currency;
    @NotNull(message = "Transaction date is required")
    private Instant transactionDate;
}