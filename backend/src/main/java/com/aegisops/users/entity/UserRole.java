package com.aegisops.users.entity;
import com.aegisops.roles.entity.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;
/**
 * Join entity for the user_roles table per DB.md §5.3.
 * Models the many-to-many between User and Role with extra columns
 * (assigned_at, assigned_by) that prevent a plain @JoinTable mapping.
 * Managed exclusively through User.userRoles (CascadeType.ALL + orphanRemoval).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_roles",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "role_id"}))
public class UserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;
    /** Populated once JWT is implemented — null until then */
    @Column(name = "assigned_by")
    private UUID assignedBy;
    @PrePersist
    protected void onCreate() {
        this.assignedAt = Instant.now();
    }
}
