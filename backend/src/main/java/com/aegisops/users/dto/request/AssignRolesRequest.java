package com.aegisops.users.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
import java.util.UUID;
/**
 * Role assignment payload for PATCH /users/{id}/roles.
 * An empty list clears all roles (replace semantics, not additive).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignRolesRequest {
    @NotNull(message = "roleIds must not be null")
    private List<UUID> roleIds;
}
