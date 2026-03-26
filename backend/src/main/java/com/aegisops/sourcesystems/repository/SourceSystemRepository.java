package com.aegisops.sourcesystems.repository;
import com.aegisops.sourcesystems.entity.SourceSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface SourceSystemRepository extends JpaRepository<SourceSystem, UUID> {
    Optional<SourceSystem> findBySlug(String slug);
    boolean existsByCode(String code);
    boolean existsBySlug(String slug);
}