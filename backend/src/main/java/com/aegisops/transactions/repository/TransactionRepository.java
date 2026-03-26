package com.aegisops.transactions.repository;

import com.aegisops.transactions.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>,
        JpaSpecificationExecutor<Transaction> {

    /**
     * Find reference transactions with the same external ID and source system,
     * but a different primary key. Returns a list to handle the multiple-match
     * scenario (reconciliation sets NEEDS_REVIEW when count > 1).
     */
    List<Transaction> findAllByExternalTransactionIdAndSourceSystemIdAndIdNot(
            String externalTransactionId, UUID sourceSystemId, UUID id);

    /**
     * Single-match convenience — kept for backward compatibility.
     */
    Optional<Transaction> findByExternalTransactionIdAndSourceSystemIdAndIdNot(
            String externalTransactionId, UUID sourceSystemId, UUID id);
}