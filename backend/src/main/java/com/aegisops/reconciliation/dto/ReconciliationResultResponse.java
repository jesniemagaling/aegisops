package com.aegisops.reconciliation.dto;

import com.aegisops.common.enums.ReconciliationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for reconciliation results — hides entity from API layer.
 * Ready for use when the reconciliation controller is introduced.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationResultResponse {

    private UUID id;
    private UUID transactionId;
    private UUID matchedTransactionId;
    private ReconciliationStatus resultStatus;
    private String mismatchReason;
    private BigDecimal amountDifference;
    private Instant createdAt;
}

