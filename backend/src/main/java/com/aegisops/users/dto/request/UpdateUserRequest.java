package com.aegisops.users.dto.request;
import com.aegisops.common.enums.UserStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
/**
 * Partial update — only non-null fields are applied.
 * Status values are constrained to UserStatus enum (ACTIVE, INACTIVE, LOCKED).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
    private String fullName;
    private UserStatus status;
}
