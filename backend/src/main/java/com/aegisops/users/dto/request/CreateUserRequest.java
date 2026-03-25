package com.aegisops.users.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
import java.util.UUID;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
    private String fullName;
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    /** Optional initial role assignments */
    private List<UUID> roleIds;
}
