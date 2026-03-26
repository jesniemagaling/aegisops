package com.aegisops.reconciliation.repository;

import com.aegisops.reconciliation.entity.ReconciliationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReconciliationResultRepository extends JpaRepository<ReconciliationResult, UUID> {

    List<ReconciliationResult> findByTransactionId(UUID transactionId);

    /**
     * Remove existing reconciliation results for a transaction before a new run.
     * Prevents duplicate results when reconciliation is re-triggered.
     */
    void deleteByTransactionId(UUID transactionId);
}

