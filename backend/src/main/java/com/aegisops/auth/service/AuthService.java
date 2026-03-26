package com.aegisops.auth.service;
import com.aegisops.audit.service.AuditService;
import com.aegisops.auth.dto.LoginRequest;
import com.aegisops.auth.dto.LoginResponse;
import com.aegisops.auth.security.JwtService;
import com.aegisops.common.config.SecurityUtils;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import com.aegisops.common.enums.UserStatus;
import com.aegisops.common.exception.BusinessException;
import com.aegisops.common.exception.ErrorCode;
import com.aegisops.common.exception.ResourceNotFoundException;
import com.aegisops.common.exception.UnauthorizedException;
import com.aegisops.users.dto.response.UserResponse;
import com.aegisops.users.entity.User;
import com.aegisops.users.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
/**
 * Authentication service per FRD Section 4.1.
 * Validates credentials, checks user status, generates JWT.
 */
@Slf4j
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().strip();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ERR_FORBIDDEN,
                    "Account is " + user.getStatus().name().toLowerCase());
        }
        List<String> roles = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getCode())
                .toList();
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roles);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
        log.info("User logged in [id={}]", user.getId());

        auditService.logAction(AuditEntityType.USER, user.getId(), AuditAction.LOGIN,
                "User logged in with email " + email);

        return LoginResponse.builder()
                .accessToken(token)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .roles(roles)
                        .build())
                .build();
    }

    /**
     * Get the currently authenticated user's profile per API.md §5 — GET /auth/me.
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UUID userId = SecurityUtils.requireCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        List<String> roles = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getCode())
                .toList();
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}