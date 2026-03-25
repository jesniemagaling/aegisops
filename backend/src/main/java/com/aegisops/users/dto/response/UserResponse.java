package com.aegisops.users.dto.response;
import com.aegisops.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
/**
 * Safe user projection for API responses.
 * Password hash is deliberately excluded.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private UserStatus status;
    /** Role codes: ADMIN, ANALYST, AUDITOR, VIEWER */
    private List<String> roles;
    private Instant createdAt;
    private Instant updatedAt;
}
