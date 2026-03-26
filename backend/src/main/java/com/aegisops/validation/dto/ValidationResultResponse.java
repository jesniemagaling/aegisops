package com.aegisops.validation.dto;

import com.aegisops.common.enums.ValidationSeverity;
import com.aegisops.common.enums.ValidationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for validation results — hides entity from API layer.
 * Ready for use when the validation controller is introduced.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResultResponse {

    private UUID id;
    private UUID transactionId;
    private String ruleCode;
    private ValidationSeverity severity;
    private ValidationStatus status;
    private String message;
    private String fieldName;
    private Instant createdAt;
}

