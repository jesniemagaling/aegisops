package com.aegisops.transactions.dto.response;
import com.aegisops.common.enums.ReconciliationStatus;
import com.aegisops.common.enums.ReviewStatus;
import com.aegisops.common.enums.TransactionLifecycle;
import com.aegisops.common.enums.ValidationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private UUID id;
    private UUID sourceSystemId;
    private String externalTransactionId;
    private String referenceId;
    private String transactionType;
    private BigDecimal amountIn;
    private BigDecimal amountOut;
    private String currency;
    private Instant occurredAt;
    private LocalDate businessDate;
    private TransactionLifecycle lifecycleStatus;
    private ValidationStatus validationStatus;
    private ReconciliationStatus reconciliationStatus;
    private ReviewStatus reviewStatus;
    private Instant createdAt;
    private Instant updatedAt;
}