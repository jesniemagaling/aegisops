package com.aegisops.sourcesystems.entity;
import com.aegisops.common.entity.BaseEntity;
import com.aegisops.common.enums.SourceSystemStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;
/**
 * Source system entity per DB.md Section 5.4.
 * Extends BaseEntity for id, createdAt, updatedAt.
 * Slug is a unique URL-safe identifier used for API filtering.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "source_systems")
public class SourceSystem extends BaseEntity {
    @Column(name = "code", unique = true, nullable = false, length = 100)
    private String code;
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    @Column(name = "slug", unique = true, nullable = false, length = 100)
    private String slug;
    @Column(name = "type", nullable = false, length = 100)
    private String type;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private SourceSystemStatus status;
    @Column(name = "timezone", length = 100)
    private String timezone;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config_json", columnDefinition = "jsonb")
    private Map<String, Object> configJson;
}