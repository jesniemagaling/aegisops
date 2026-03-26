package com.aegisops.users.service;
import com.aegisops.audit.service.AuditService;
import com.aegisops.common.dto.PagedResponse;
import com.aegisops.common.enums.AuditAction;
import com.aegisops.common.enums.AuditEntityType;
import com.aegisops.common.enums.UserStatus;
import com.aegisops.common.exception.BusinessException;
import com.aegisops.common.exception.ErrorCode;
import com.aegisops.common.exception.ResourceNotFoundException;
import com.aegisops.roles.entity.Role;
import com.aegisops.roles.repository.RoleRepository;
import com.aegisops.users.dto.request.AssignRolesRequest;
import com.aegisops.users.dto.request.CreateUserRequest;
import com.aegisops.users.dto.request.UpdateUserRequest;
import com.aegisops.users.dto.response.UserResponse;
import com.aegisops.users.entity.User;
import com.aegisops.users.entity.UserRole;
import com.aegisops.users.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
/**
 * Domain service for user lifecycle management.
 *
 * Design decisions:
 * - Email normalised to lowercase + stripped before uniqueness check and storage.
 * - Password hashed via BCrypt; raw value is never stored.
 * - Role assignment uses replace semantics: the full desired set is supplied
 *   and the existing set is replaced atomically (orphanRemoval handles deletes).
 * - Pagination is 1-based in the API (per API.md §4.1) and converted to
 *   0-based internally for Spring Data.
 */
@Slf4j
@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }
    // -----------------------------------------------------------------------
    // Write operations
    // -----------------------------------------------------------------------
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = request.getEmail().toLowerCase().strip();
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION,
                    "An account with email '" + email + "' already exists");
        }
        User user = new User();
        user.setEmail(email);
        user.setFullName(request.getFullName().strip());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            List<UUID> distinctIds = request.getRoleIds().stream().distinct().toList();
            List<Role> roles = roleRepository.findAllById(distinctIds);
            if (roles.size() != distinctIds.size()) {
                throw new BusinessException(ErrorCode.ERR_NOT_FOUND,
                        "One or more role IDs were not found");
            }
            roles.forEach(role -> user.getUserRoles().add(
                    UserRole.builder().user(user).role(role).build()
            ));
        }
        User saved = userRepository.save(user);
        log.info("User created [id={}]", saved.getId());

        auditService.logAction(AuditEntityType.USER, saved.getId(), AuditAction.CREATE,
                "Created user with email " + email);

        return toResponse(saved);
    }
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findById(id);
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().strip());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        User saved = userRepository.save(user);
        log.info("User updated [id={}]", saved.getId());

        auditService.logAction(AuditEntityType.USER, saved.getId(), AuditAction.UPDATE,
                "Updated user " + saved.getEmail());

        return toResponse(saved);
    }
    @Transactional
    public UserResponse assignRoles(UUID userId, AssignRolesRequest request) {
        User user = findById(userId);
        List<UUID> distinctIds = request.getRoleIds().stream().distinct().toList();
        List<Role> roles = roleRepository.findAllById(distinctIds);
        if (roles.size() != distinctIds.size()) {
            throw new BusinessException(ErrorCode.ERR_NOT_FOUND,
                    "One or more role IDs were not found");
        }
        user.getUserRoles().clear();
        roles.forEach(role -> user.getUserRoles().add(
                UserRole.builder().user(user).role(role).build()
        ));
        User saved = userRepository.save(user);
        log.info("Roles replaced for user [id={}]: {}", userId, distinctIds);

        auditService.logAction(AuditEntityType.USER, saved.getId(), AuditAction.UPDATE_ROLES,
                "Roles updated for user " + saved.getEmail() + ", roleIds=" + distinctIds);

        return toResponse(saved);
    }
    // -----------------------------------------------------------------------
    // Read operations
    // -----------------------------------------------------------------------
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsers(int page, int size) {
        Page<User> result = userRepository.findAll(PageRequest.of(page - 1, size));
        List<UserResponse> items = result.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PagedResponse.<UserResponse>builder()
                .page(page)
                .size(size)
                .totalItems(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .items(items)
                .build();
    }
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return toResponse(findById(id));
    }
    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------
    private User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
    }
    /**
     * Maps a managed User entity to a safe response DTO.
     * Accesses userRoles lazily — must be called within an active transaction.
     * Role codes (not display names) are returned, matching the seeded values
     * ADMIN, ANALYST, AUDITOR, VIEWER from DB.md §5.2 seed data.
     */
    private UserResponse toResponse(User user) {
        List<String> roleCodes = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getCode())
                .toList();
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .roles(roleCodes)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
