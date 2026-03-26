package com.aegisops.users.controller;
import com.aegisops.common.dto.ApiResponse;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.RoleCode;
import com.aegisops.users.dto.request.AssignRolesRequest;
import com.aegisops.users.dto.request.CreateUserRequest;
import com.aegisops.users.dto.request.UpdateUserRequest;
import com.aegisops.users.dto.response.UserResponse;
import com.aegisops.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;
/**
 * REST controller for the users domain per API.md §6.1.
 *
 * Base path: /users  (combined with context-path /api/v1 → /api/v1/users)
 *
 * POST   /users               — create user          (ADMIN only)
 * GET    /users               — list users            (ADMIN, ANALYST)
 * GET    /users/{id}          — get user by id        (ADMIN, ANALYST)
 * PATCH  /users/{id}          — partial update        (ADMIN only)
 * PATCH  /users/{id}/roles    — replace role assigns  (ADMIN only)
 *
 * Rules:
 * - DTOs only — entities never returned
 * - ApiResponse wrapper on every response
 * - Constructor injection — no @Autowired
 * - RBAC enforced via @PreAuthorize
 */
@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PreAuthorize(RoleCode.HAS_ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User created successfully"));
    }
    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST)
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int size) {
        PagedResponse<UserResponse> response = userService.getUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    @PreAuthorize(RoleCode.HAS_ADMIN_ANALYST)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    @PreAuthorize(RoleCode.HAS_ADMIN)
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "User updated successfully"));
    }
    @PreAuthorize(RoleCode.HAS_ADMIN)
    @PatchMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserResponse>> assignRoles(
            @PathVariable UUID id,
            @Valid @RequestBody AssignRolesRequest request) {
        UserResponse response = userService.assignRoles(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Roles assigned successfully"));
    }
}
