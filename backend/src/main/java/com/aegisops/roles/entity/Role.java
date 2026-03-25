package com.aegisops.roles.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;
/**
 * Represents a system role per DB.md §5.2.
 * Does NOT extend BaseEntity — the roles table has no updated_at column.
 * Roles are seeded via Flyway migration (V1__initial_schema.sql).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    /** Stable machine identifier: ADMIN, ANALYST, AUDITOR, VIEWER */
    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;
    /** Human-readable display name */
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    @Column(name = "description", length = 500)
    private String description;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
