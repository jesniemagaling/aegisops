package com.aegisops.auth.controller;
import com.aegisops.auth.dto.LoginRequest;
import com.aegisops.auth.dto.LoginResponse;
import com.aegisops.auth.service.AuthService;
import com.aegisops.common.dto.ApiResponse;
import com.aegisops.common.enums.RoleCode;
import com.aegisops.users.dto.response.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
/**
 * Authentication endpoints per API.md Section 5.
 *
 * POST /auth/login — authenticate user and return JWT.
 * GET  /auth/me    — return current authenticated user's profile.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PreAuthorize(RoleCode.HAS_ANY_ROLE)
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}