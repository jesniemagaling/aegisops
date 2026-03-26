package com.aegisops.validation.repository;

import com.aegisops.validation.entity.ValidationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ValidationResultRepository extends JpaRepository<ValidationResult, UUID> {

    List<ValidationResult> findByTransactionId(UUID transactionId);
}

