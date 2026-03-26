-- =============================================
-- V4: Relax reconciliation_results FK and add updated_at
-- =============================================

-- Make reconciliation_run_id nullable so inline reconciliation works
ALTER TABLE reconciliation_results ALTER COLUMN reconciliation_run_id DROP NOT NULL;

-- Add updated_at for BaseEntity compatibility
ALTER TABLE reconciliation_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
UPDATE reconciliation_results SET updated_at = created_at WHERE updated_at IS NULL;

