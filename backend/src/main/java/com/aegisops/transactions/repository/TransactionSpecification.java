package com.aegisops.transactions.repository;

import com.aegisops.common.enums.ReconciliationStatus;
import com.aegisops.common.enums.ValidationStatus;
import com.aegisops.transactions.entity.Transaction;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA Specification builder for dynamic transaction filtering per API.md §6.4.
 * Supports: sourceSystemId, dateFrom/dateTo (occurredAt), businessDate,
 * validationStatus, reconciliationStatus.
 */
public final class TransactionSpecification {

    private TransactionSpecification() {
        // utility class
    }

    public static Specification<Transaction> withFilters(UUID sourceSystemId,
                                                         Instant dateFrom,
                                                         Instant dateTo,
                                                         LocalDate businessDate,
                                                         ValidationStatus validationStatus,
                                                         ReconciliationStatus reconciliationStatus) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (sourceSystemId != null) {
                predicates.add(cb.equal(root.get("sourceSystemId"), sourceSystemId));
            }
            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), dateTo));
            }
            if (businessDate != null) {
                predicates.add(cb.equal(root.get("businessDate"), businessDate));
            }
            if (validationStatus != null) {
                predicates.add(cb.equal(root.get("validationStatus"), validationStatus));
            }
            if (reconciliationStatus != null) {
                predicates.add(cb.equal(root.get("reconciliationStatus"), reconciliationStatus));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

