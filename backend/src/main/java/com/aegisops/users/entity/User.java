package com.aegisops.users.entity;
import com.aegisops.common.entity.BaseEntity;
import com.aegisops.common.enums.UserStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
/**
 * Canonical user entity per DB.md §5.1.
 * Extends BaseEntity for id, createdAt, updatedAt.
 * Does NOT use @Builder — Lombok builder + JPA inheritance requires @SuperBuilder
 * on BaseEntity. Setters are used in the service layer instead.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    @Column(name = "email", unique = true, nullable = false, length = 255)
    private String email;
    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;
    /** BCrypt hash — never the raw password */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private UserStatus status;
    @Column(name = "last_login_at")
    private Instant lastLoginAt;
    /**
     * Bidirectional association to user_roles.
     * CascadeType.ALL + orphanRemoval = true: adding/removing entries from this
     * list is the sole mechanism for assigning or revoking roles.
     * Collection initialised at field level to avoid NPE on new instances.
     */
    @OneToMany(mappedBy = "user",
               cascade = CascadeType.ALL,
               orphanRemoval = true,
               fetch = FetchType.LAZY)
    private List<UserRole> userRoles = new ArrayList<>();
}
