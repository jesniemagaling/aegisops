-- =============================================
-- AegisOps Database Schema - Initial Migration
-- =============================================

-- ===================
-- SECURITY DOMAIN
-- ===================

CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id              UUID PRIMARY KEY,
    code            VARCHAR(50)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    id              UUID PRIMARY KEY,
    user_id         UUID         NOT NULL REFERENCES users(id),
    role_id         UUID         NOT NULL REFERENCES roles(id),
    assigned_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    assigned_by     UUID,
    UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- ===================
-- SOURCE DOMAIN
-- ===================

CREATE TABLE source_systems (
    id              UUID PRIMARY KEY,
    code            VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(100) NOT NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    timezone        VARCHAR(100),
    config_json     JSONB,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ===================
-- INGESTION DOMAIN
-- ===================

CREATE TABLE ingestion_batches (
    id                  UUID PRIMARY KEY,
    source_system_id    UUID         NOT NULL REFERENCES source_systems(id),
    ingestion_method    VARCHAR(50)  NOT NULL,
    file_name           VARCHAR(500),
    batch_reference     VARCHAR(255),
    status              VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    total_records       INTEGER      DEFAULT 0,
    success_count       INTEGER      DEFAULT 0,
    failed_count        INTEGER      DEFAULT 0,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_by          UUID,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ingestion_batches_source ON ingestion_batches(source_system_id);
CREATE INDEX idx_ingestion_batches_status ON ingestion_batches(status);

CREATE TABLE raw_transactions (
    id                      UUID PRIMARY KEY,
    source_system_id        UUID         NOT NULL REFERENCES source_systems(id),
    ingestion_batch_id      UUID         NOT NULL REFERENCES ingestion_batches(id),
    raw_line_number         INTEGER,
    external_transaction_id VARCHAR(255),
    received_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    normalization_status    VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    validation_status       VARCHAR(50),
    raw_payload_json        JSONB        NOT NULL,
    parse_error_message     TEXT,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_raw_tx_source ON raw_transactions(source_system_id);
CREATE INDEX idx_raw_tx_batch ON raw_transactions(ingestion_batch_id);
CREATE INDEX idx_raw_tx_external_id ON raw_transactions(external_transaction_id);

-- ===================
-- CORE DOMAIN
-- ===================

CREATE TABLE transactions (
    id                      UUID PRIMARY KEY,
    source_system_id        UUID         NOT NULL REFERENCES source_systems(id),
    ingestion_batch_id      UUID         NOT NULL REFERENCES ingestion_batches(id),
    raw_transaction_id      UUID         REFERENCES raw_transactions(id),
    external_transaction_id VARCHAR(255),
    reference_id            VARCHAR(255),
    transaction_type        VARCHAR(100),
    amount_in               NUMERIC(19,4),
    amount_out              NUMERIC(19,4),
    currency                VARCHAR(10),
    occurred_at             TIMESTAMPTZ,
    business_date           DATE,
    lifecycle_status        VARCHAR(50)  NOT NULL DEFAULT 'INGESTED',
    validation_status       VARCHAR(50),
    reconciliation_status   VARCHAR(50),
    review_status           VARCHAR(50),
    metadata_json           JSONB,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_source ON transactions(source_system_id);
CREATE INDEX idx_tx_batch ON transactions(ingestion_batch_id);
CREATE INDEX idx_tx_business_date ON transactions(business_date);
CREATE INDEX idx_tx_lifecycle ON transactions(lifecycle_status);
CREATE INDEX idx_tx_validation ON transactions(validation_status);
CREATE INDEX idx_tx_reconciliation ON transactions(reconciliation_status);
CREATE INDEX idx_tx_source_date ON transactions(source_system_id, business_date);
CREATE INDEX idx_tx_external_id ON transactions(external_transaction_id);

CREATE TABLE validation_results (
    id                  UUID PRIMARY KEY,
    transaction_id      UUID         NOT NULL REFERENCES transactions(id),
    rule_code           VARCHAR(100) NOT NULL,
    severity            VARCHAR(50)  NOT NULL,
    status              VARCHAR(50)  NOT NULL,
    message             TEXT,
    details_json        JSONB,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_validation_tx ON validation_results(transaction_id);

-- ===================
-- RECONCILIATION DOMAIN
-- ===================

CREATE TABLE reconciliation_runs (
    id                  UUID PRIMARY KEY,
    source_a_id         UUID         NOT NULL REFERENCES source_systems(id),
    source_b_id         UUID         NOT NULL REFERENCES source_systems(id),
    date_from           DATE         NOT NULL,
    date_to             DATE         NOT NULL,
    matching_strategy   VARCHAR(100),
    status              VARCHAR(50)  NOT NULL DEFAULT 'QUEUED',
    requested_by        UUID,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    summary_json        JSONB,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recon_runs_status ON reconciliation_runs(status);

CREATE TABLE reconciliation_results (
    id                      UUID PRIMARY KEY,
    reconciliation_run_id   UUID         NOT NULL REFERENCES reconciliation_runs(id),
    transaction_id          UUID         NOT NULL REFERENCES transactions(id),
    matched_transaction_id  UUID,
    result_status           VARCHAR(50)  NOT NULL,
    mismatch_reason         TEXT,
    amount_difference       NUMERIC(19,4),
    review_status           VARCHAR(50),
    review_comment          TEXT,
    reviewed_by             UUID,
    reviewed_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recon_results_run ON reconciliation_results(reconciliation_run_id);
CREATE INDEX idx_recon_results_tx ON reconciliation_results(transaction_id);

-- ===================
-- ALERTS DOMAIN
-- ===================

CREATE TABLE alerts (
    id              UUID PRIMARY KEY,
    entity_type     VARCHAR(50)  NOT NULL,
    entity_id       UUID         NOT NULL,
    severity        VARCHAR(50)  NOT NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'OPEN',
    message         TEXT         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_entity ON alerts(entity_type, entity_id);
CREATE INDEX idx_alerts_status ON alerts(status);

-- ===================
-- AI DOMAIN
-- ===================

CREATE TABLE ai_queries (
    id                  UUID PRIMARY KEY,
    user_id             UUID         NOT NULL REFERENCES users(id),
    transaction_id      UUID         REFERENCES transactions(id),
    query_text          TEXT         NOT NULL,
    response_text       TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_queries_user ON ai_queries(user_id);

CREATE TABLE ai_insights (
    id                  UUID PRIMARY KEY,
    transaction_id      UUID         REFERENCES transactions(id),
    insight_type        VARCHAR(100) NOT NULL,
    insight_data        JSONB,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_tx ON ai_insights(transaction_id);

-- ===================
-- ASYNC DOMAIN
-- ===================

CREATE TABLE jobs (
    id              UUID PRIMARY KEY,
    job_type        VARCHAR(50)  NOT NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'QUEUED',
    requested_by    UUID,
    reference_id    UUID,
    payload_json    JSONB,
    result_json     JSONB,
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type_status ON jobs(job_type, status);
CREATE INDEX idx_jobs_created ON jobs(status, created_at);

-- ===================
-- AUDIT DOMAIN
-- ===================

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY,
    user_id         UUID,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       UUID,
    details_json    JSONB,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ===================
-- SEED DATA
-- ===================

INSERT INTO roles (id, code, name, description) VALUES
    (gen_random_uuid(), 'ADMIN', 'Administrator', 'Full system access'),
    (gen_random_uuid(), 'ANALYST', 'Analyst', 'Operational investigation and reconciliation'),
    (gen_random_uuid(), 'AUDITOR', 'Auditor', 'Read-only governance access'),
    (gen_random_uuid(), 'VIEWER', 'Viewer', 'Read-only basic access');

